import bcrypt

def hash_password(raw_password: str) -> bytes:
    password_b = raw_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=password_b, salt=salt)
    return hashed_password

def check_password(entered_pass: str, saved_pass: bytes) -> bool:
    return bcrypt.checkpw(entered_pass.encode("utf-8"), saved_pass)
