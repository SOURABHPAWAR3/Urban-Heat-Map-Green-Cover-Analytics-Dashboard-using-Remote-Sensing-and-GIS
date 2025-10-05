# backend/test_api.py
import requests
import json
import sys
import traceback

BASE = "http://127.0.0.1:5000"

def pretty(resp):
    print(f"Status: {resp.status_code}")
    print("Response headers:", dict(resp.headers))
    try:
        print("Body (json):", json.dumps(resp.json(), indent=2))
    except Exception:
        print("Body (text):", resp.text)

def try_register(payload):
    print("\n➡️  Registering user:", payload)
    try:
        r = requests.post(f"{BASE}/api/register", json=payload, timeout=10)
        pretty(r)
        return r
    except Exception as e:
        print("❌ Register request error:", e)
        traceback.print_exc()
        return None

def try_login(payload):
    print("\n➡️  Logging in with:", payload)
    try:
        r = requests.post(f"{BASE}/api/login", json=payload, timeout=10)
        pretty(r)
        return r
    except Exception as e:
        print("❌ Login request error:", e)
        traceback.print_exc()
        return None

def try_me(token):
    print("\n➡️  Calling /api/me with token...")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = requests.get(f"{BASE}/api/me", headers=headers, timeout=10)
        pretty(r)
        return r
    except Exception as e:
        print("❌ /me request error:", e)
        traceback.print_exc()
        return None

def main():
    username = "testuser@example.com"
    password = "testpassword123"

    if len(sys.argv) >= 3:
        username = sys.argv[1]
        password = sys.argv[2]
    else:
        print("🔧 No args passed. Using default test credentials:")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print("💡 You can run with: python test_api.py your@email.com yourpassword")

    payload = {"username": username, "password": password}

    # Try Register
    r = try_register(payload)

    # Try Login
    lr = try_login(payload)

    token = None
    if lr is not None and lr.status_code == 200:
        try:
            token = lr.json().get("token")
            print("\n✅ Token received:", token[:60] + "..." if token else None)
        except Exception:
            print("⚠️ Login succeeded but token could not be parsed.")

    if token:
        try_me(token)
    else:
        print("\n❌ Could not retrieve token. Check backend /api/login.")

if __name__ == "__main__":
    main()
