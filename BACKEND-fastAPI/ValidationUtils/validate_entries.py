import os
from dotenv import load_dotenv

load_dotenv()
INVALID_CHARACTERS = os.getenv("INVALID_CHARACTERS").split(",")

def validate_string(string_to_validate: str) -> bool:
    for ic in INVALID_CHARACTERS:
        if ic in string_to_validate:
            return False
    return True

def validate_reset_time(list: list) -> bool:
    for num in list:
        if num < 0 or num > 86_400:
            return False
    return True