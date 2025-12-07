import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def verify():
    # 1. Signup as User
    print_step("Signup as standard user")
    user_email = "user@example.com"
    user_password = "password123"
    payload = {
        "email": user_email,
        "password": user_password,
        "full_name": "Test User",
        "role": "user"
    }
    # Clean up if exists (optional, or just handle error)
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
    if response.status_code == 400 and "already exists" in response.text:
        print("User already exists, proceeding to login.")
    else:
        print(f"Signup Status: {response.status_code}")
        print(response.json())

    # 2. Login
    print_step("Login as user")
    login_data = {"username": user_email, "password": user_password}
    response = requests.post(f"{BASE_URL}/auth/login/access-token", data=login_data)
    if response.status_code != 200:
        print("Login failed")
        print(response.text)
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful, token obtained.")

    # 3. Check /users/me
    print_step("Check /users/me")
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(response.json())

    # 4. Check Admin endpoint (should fail)
    print_step("Check Admin endpoint /users (should fail for user)")
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print(f"Status: {response.status_code} (Expected 403)")
    if response.status_code == 403:
        print("Success: Access denied as expected.")
    else:
        print("Failure: Access was not denied!")

    # 5. Signup as Admin
    print_step("Signup as Admin")
    admin_email = "admin@example.com"
    admin_payload = {
        "email": admin_email,
        "password": user_password,
        "full_name": "Admin User",
        "role": "admin"
    }
    response = requests.post(f"{BASE_URL}/auth/signup", json=admin_payload)
    if response.status_code == 400 and "already exists" in response.text:
        print("Admin already exists, proceeding to login.")
    
    # Login Admin
    print_step("Login as Admin")
    response = requests.post(f"{BASE_URL}/auth/login/access-token", data={"username": admin_email, "password": user_password})
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 6. Check Admin endpoint as Admin (should pass)
    print_step("Check Admin endpoint /users as Admin")
    response = requests.get(f"{BASE_URL}/users/", headers=admin_headers)
    print(f"Status: {response.status_code} (Expected 200)")
    if response.status_code == 200:
        print("Success: Admin access granted.")
        # print(response.json())
    else:
        print("Failure: Admin access denied!")

if __name__ == "__main__":
    verify()
