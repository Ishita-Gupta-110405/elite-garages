import pytest
from app.core_security import hash_password, verify_password
from app.models.user import User

def test_password_hashing_uses_unique_salts():
    """Ensure two identical passwords produce completely different hash strings (salting)."""
    raw_password = "SuperSecretPassword123!"
    hash1 = hash_password(raw_password)
    hash2 = hash_password(raw_password)

    assert hash1 != hash2
    assert verify_password(raw_password, hash1) is True
    assert verify_password(raw_password, hash2) is True

def test_sql_injection_attempt_in_registration_name(client, db_session):
    """Ensure raw SQL payload strings are escaped/parameterized by ORM, not executed."""
    malicious_name = "Robert'); DROP TABLE users;--"
    payload = {
        "email": "bobby_tables@example.com",
        "password": "SecurePassword123!",
        "full_name": malicious_name
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201

    # Verify table 'users' is intact and the literal malicious payload was saved as text
    user = db_session.query(User).filter(User.email == "bobby_tables@example.com").first()
    assert user is not None
    assert user.full_name == malicious_name