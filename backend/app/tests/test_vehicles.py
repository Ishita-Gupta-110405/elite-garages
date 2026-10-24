import pytest
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.vehicle import Order
from app.core_security import hash_password, create_access_token

@pytest.fixture
def test_admin_token(db_session):
    admin = User(
        email="admin@dealership.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Dealership Admin",
        is_admin=True
    )
    db_session.add(admin)
    db_session.commit()
    return create_access_token(data={"sub": str(admin.id), "email": admin.email, "is_admin": True})

@pytest.fixture
def test_user_token(db_session):
    user = User(
        email="buyer@dealership.com",
        hashed_password=hash_password("BuyerPass123!"),
        full_name="Standard Buyer",
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    return create_access_token(data={"sub": str(user.id), "email": user.email, "is_admin": False})

# --- RBAC & CRUD Tests ---

def test_create_vehicle_as_admin_success(client, test_admin_token):
    payload = {
        "make": "Toyota",
        "model": "GR Supra",
        "category": "Coupe",
        "price": 54000.0,
        "quantity": 5
    }
    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {test_admin_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["make"] == "Toyota"
    assert data["quantity"] == 5
    assert "id" in data

def test_create_vehicle_as_non_admin_fails(client, test_user_token):
    payload = {
        "make": "Honda",
        "model": "Civic Type R",
        "category": "Hatchback",
        "price": 44000.0,
        "quantity": 2
    }
    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 403

def test_get_vehicles_list(client, test_user_token):
    # Verify accessible by standard logged-in user
    response = client.get(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# --- Inventory Purchase Edge Cases ---

def test_purchase_vehicle_depletes_stock(client, db_session, test_user_token):
    vehicle = Vehicle(make="Ford", model="Mustang", category="Coupe", price=45000.0, quantity=1)
    db_session.add(vehicle)
    db_session.commit()

    # First purchase succeeds
    response = client.post(
        f"/api/vehicles/{vehicle.id}/purchase",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    assert response.json()["quantity"] == 0

    # Second purchase attempt must fail with 400 Bad Request
    response_fail = client.post(
        f"/api/vehicles/{vehicle.id}/purchase",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response_fail.status_code == 400
    assert "out of stock" in response_fail.json()["detail"].lower()

def test_purchase_nonexistent_vehicle_returns_404(client, test_user_token):
    response = client.post(
        "/api/vehicles/99999/purchase",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 404

# --- Search Filtering & Boundary Edge Cases ---

def test_search_vehicles_by_price_and_make(client, db_session, test_user_token):
    v1 = Vehicle(make="Tesla", model="Model 3", category="Sedan", price=38000.0, quantity=3)
    v2 = Vehicle(make="BMW", model="M3", category="Sedan", price=75000.0, quantity=2)
    db_session.add_all([v1, v2])
    db_session.commit()

    # Filter price range 30,000 to 50,000
    response = client.get(
        "/api/vehicles/search?min_price=30000&max_price=50000",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["make"] == "Tesla"

def test_search_invalid_price_boundary_fails(client, test_user_token):
    # min_price higher than max_price should return 422 or 400 validation error
    response = client.get(
        "/api/vehicles/search?min_price=80000&max_price=20000",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 400

def test_purchase_creates_order_audit_record(client, db_session, test_user_token):
    vehicle = Vehicle(make="Mazda", model="Miata", category="Convertible", price=50000.0, quantity=3)
    db_session.add(vehicle)
    db_session.commit()

    response = client.post(
        f"/api/vehicles/{vehicle.id}/purchase",
        headers={"Authorization":f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    order = db_session.query(Order).filter(Order.vehicle_id == vehicle.id).first()
    assert order is not None
    assert order.purchase_price == 50000.0

def test_get_user_order_history(client, db_session, test_user_token):
    vehicle = Vehicle(make="Porsche", model="911 Carrera", category="Coupe", price=115000.0, quantity=2)
    db_session.add(vehicle)
    db_session.commit()

    client.post(
        f"/api/vehicles/{vehicle.id}/purchase",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )

    response = client.get(
        "/api/vehicles/orders/history",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 1
    assert orders[0]["vehicle_id"] == vehicle.id
    assert orders[0]["purchase_price"] == 115000.0
