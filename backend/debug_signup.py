import requests

def test_signup():
    url = "http://localhost:8000/api/v1/auth/signup"
    data = {
        "email": "test_debug_422@example.com",
        "password": "password123",
        "full_name": "Debug User",
        "role": "user",
        "otp": "123456"
    }
    
    # We expect this might fail with 422, let's print why
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_signup()
