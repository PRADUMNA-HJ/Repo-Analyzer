import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_registration_and_login_flow():
    email = f"dr.smith.{uuid.uuid4().hex[:6]}@university.edu"
    # 1. Register a new faculty account
    reg_payload = {
        "email": email,
        "password": "strongPassword123",
        "full_name": "Dr. Sarah Smith",
        "department": "Department of Computer Science",
        "role": "FACULTY"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email
    assert reg_data["user"]["role"] == "FACULTY"

    token = reg_data["access_token"]

    # 2. Prevent duplicate email registration
    dup_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400
    assert "already registered" in dup_resp.json()["detail"]

    # 3. Login with credentials
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "strongPassword123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Login with invalid password
    bad_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "wrongPassword!"
    })
    assert bad_login.status_code == 401

    # 5. Access /me endpoint with Bearer token
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

    # 6. Access /me without token fails
    unauth_resp = client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401


def test_rbac_admin_access():
    admin_email = f"admin.{uuid.uuid4().hex[:6]}@university.edu"
    student_email = f"student.{uuid.uuid4().hex[:6]}@university.edu"

    # Register admin
    admin_payload = {
        "email": admin_email,
        "password": "adminPassword123",
        "full_name": "Dean of Engineering",
        "department": "Dean's Office",
        "role": "ADMIN"
    }
    admin_resp = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_resp.status_code == 201
    admin_token = admin_resp.json()["access_token"]

    # Register student
    student_payload = {
        "email": student_email,
        "password": "studentPassword123",
        "full_name": "Undergraduate Student",
        "department": "CSE",
        "role": "STUDENT"
    }
    student_resp = client.post("/api/v1/auth/register", json=student_payload)
    assert student_resp.status_code == 201
    student_token = student_resp.json()["access_token"]

    # Student cannot access /users (Admin only)
    forbidden_resp = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {student_token}"})
    assert forbidden_resp.status_code == 403

    # Admin can access /users
    users_resp = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert users_resp.status_code == 200
    assert isinstance(users_resp.json(), list)
    assert len(users_resp.json()) >= 2
