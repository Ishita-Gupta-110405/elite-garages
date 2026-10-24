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
    assert "password" not in data  # Never expose hashed or plain passwords

def test_register_duplicate_email_fails(client):
    payload = {
        "email": "customer@dealership.com",
        "password": "SecurePassword123!",
        "full_name": "Jane Doe"
    }
    # First registration
    client.post("/api/auth/register", json=payload)
    # Duplicate attempt
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()