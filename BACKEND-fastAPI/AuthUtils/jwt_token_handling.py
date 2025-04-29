import jwt
from .consts import JWT_SECRET_KEY_TEMP, EXPIERY_TIME_MINUTES, DATE_FORMAT
from datetime import datetime, timedelta

def generate_jwt(user_ID):
    user_ID = str(user_ID)
    datestamp = datetime.now()
    expiery_date = (datestamp) + timedelta(minutes=EXPIERY_TIME_MINUTES)
    print(datestamp)
    
    payload = {
        "user_ID": user_ID,
        "issued_at": str(datestamp),
        "expires": str(expiery_date)
    }
    return jwt.encode(payload, JWT_SECRET_KEY_TEMP, algorithm="HS256"), expiery_date

def extract_payload(token) -> dict:
    return jwt.decode(token, JWT_SECRET_KEY_TEMP, algorithms=["HS256"])

def check_token_expiery(token) -> bool:
    payload = extract_payload(token)
    expiery_date = payload["expires"]
    expiery_date = datetime.strptime(expiery_date, DATE_FORMAT)
    datestamp = datetime.now()
    if datestamp < expiery_date:
        return True
    else:
        return False