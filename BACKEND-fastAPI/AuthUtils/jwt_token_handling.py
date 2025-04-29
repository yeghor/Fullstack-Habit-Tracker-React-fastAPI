import jwt
import jwt.exceptions
from .consts import JWT_SECRET_KEY_TEMP, EXPIERY_TIME_MINUTES, DATE_FORMAT
from datetime import datetime, timedelta

def generate_jwt(user_ID):
    user_ID = str(user_ID)
    datestamp = datetime.now()
    expiry_date = (datestamp + timedelta(minutes=EXPIERY_TIME_MINUTES))
    
    expiry_date_unix_str = str(round(expiry_date.timestamp()))
    payload = {
        "user_ID": user_ID,
        "issued_at": str(round(datestamp.timestamp())),
        "expires": expiry_date_unix_str
    }
    return jwt.encode(payload, JWT_SECRET_KEY_TEMP, algorithm="HS256"), expiry_date_unix_str

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
