import jwt
import jwt.exceptions
from .consts import JWT_SECRET_KEY_TEMP, EXPIERY_TIME_MINUTES, DATE_FORMAT
from datetime import datetime, timedelta

def generate_jwt(user_id):
    user_id = str(user_id)
    datestamp = datetime.now()
    expiry_date = (datestamp + timedelta(minutes=EXPIERY_TIME_MINUTES))
    
    expiry_date_unix = round(expiry_date.timestamp())
    payload = {
        "user_id": user_id,
        "issued_at": str(round(datestamp.timestamp())),
        "expires": str(expiry_date_unix)
    }
    return jwt.encode(payload, JWT_SECRET_KEY_TEMP, algorithm="HS256"), expiry_date_unix

def extract_payload(token) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY_TEMP, algorithms=["HS256"])
    except Exception:
        raise ValueError("Invalid token")

def check_token_expiery(token) -> bool:
    payload = extract_payload(token)

    now_date = datetime.now()
    now_date_unix = now_date.timestamp()
    
    print(now_date)
    if now_date_unix < float(payload["expires"]):
        return True
    else:
        return False
