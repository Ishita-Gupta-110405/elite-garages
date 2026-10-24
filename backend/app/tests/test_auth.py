def test_register_user_success(client):
    payload = {
        "email": "customer@dealership.com",
        "password": "SecurePassword123!",
        "full_name": "Jane Doe"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "customer@dealership.com"
    assert "id" in data
    assert "password" not in data

def test_register_duplicate_email_fails(client):
    payload = {
        "email": "customer@dealership.com",
        "password": "SecurePassword123!",
        "full_name": "Jane Doe"
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()

def test_register_cannot_self_assign_admin(client):
    """Ensure malicious actors cannot pass is_admin=True in registration payload."""
    payload = {
        "email": "hacker@dealership.com",
        "password": "SecurePassword123!",
        "full_name": "Bad Actor",
        "is_admin": True
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["is_admin"] is False

def test_login_success(client):
    # Register
    client.post("/api/auth/register", json={
        "email": "loginuser@dealership.com",
        "password": "MySecretPassword123!",
        "full_name": "Login User"
    })
    # Login
    response = client.post("/api/auth/login", json={
        "email": "loginuser@dealership.com",
        "password": "MySecretPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "loginuser@dealership.com"

def test_login_invalid_password_fails(client):
    client.post("/api/auth/register", json={
        "email": "wrongpass@dealership.com",
        "password": "MySecretPassword123!",
        "full_name": "Wrong Pass User"
    })
    response = client.post("/api/auth/login", json={
        "email": "wrongpass@dealership.com",
        "password": "IncorrectPassword"
    })
    assert response.status_code == 401
    assert "invalid credentials" in response.json()["detail"].lower()

def test_login_nonexistent_user_fails(client):
    response = client.post("/api/auth/login", json={
        "email": "ghost@dealership.com",
        "password": "Password123!"
    })
    assert response.status_code == 401
    assert "invalid credentials" in response.json()["detail"].lower()