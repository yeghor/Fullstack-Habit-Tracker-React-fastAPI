from main import app
from fastapi.testclient import TestClient
import pytest
from database import engine, Base

@pytest.fixture(autouse=True)
def clear_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == "Hello World"

def test_authorization():
    new_user_dict = {
        "username": "TestcaseUnique",
        "password": "Testcase",
        "email": "TestCaseUnique@test.com"
    }
    response = client.post(url="/register", json=new_user_dict)
    assert response.status_code == 200
    response_dict = response.json()
    assert type(response_dict) == dict

    token = response_dict["token"]
    token = "Bearer " + token
    response_profile = client.get("/get_user_profile", headers={"token": token})
    assert response_profile.status_code == 200
    user_profile = response_profile.json()
    assert new_user_dict["username"] == user_profile["username"]
    assert new_user_dict["email"] == user_profile["email"]


    response_logout = client.post("/logout", headers={"token": token})
    assert response_logout.status_code == 200

    response_login = client.post("/login", json=new_user_dict)
    assert response_login.status_code == 200


def test_habits():
    new_user_dict = {
        "username": "TestcaseUnique",
        "password": "Testcase",
        "email": "TestCaseUnique@test.com"
    }
    response_register = client.post("/register", json=new_user_dict)
    assert response_register.status_code == 200
    token = response_register.json()
    token = token["token"]
    token = "Bearer " + token
    response_add_habit_1 = client.post("/add_habit", json={
        "habit_name": "tescase2",
        "habit_desc": "testcase2",
        "reset_at": [
            17000, 75000
        ]}, headers={"token": token})
    response_add_habit_2 = client.post("/add_habit", json={
        "habit_name": "tescase1",
        "habit_desc": "testcase1",
        "reset_at": [
            15000, 20000, 50000
        ]}, headers={"token": token})

    assert response_add_habit_1.status_code == 200
    assert response_add_habit_2.status_code == 200

    response_get_habits = client.get("/get_habits", headers={"token": token})
    get_habits_dict = response_get_habits.json()
    assert response_get_habits.status_code == 200

