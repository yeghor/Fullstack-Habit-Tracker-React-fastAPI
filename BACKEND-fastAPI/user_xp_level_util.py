from os import getenv
from dotenv import load_dotenv
from typing import Tuple, Annotated

load_dotenv()

BASE_LEVEL_XP = int(getenv("BASE_LEVEL_XP"))
XP_GROWTH_RATE = float(getenv("XP_GROWTH_RATE"))

def get_level_by_xp(current_xp: int) -> Tuple[int, int]:
    level = 1
    total_xp = 0
    while True:
        xp_needed_to_next_level = BASE_LEVEL_XP * (XP_GROWTH_RATE ** (level - 1))
        if current_xp < total_xp + xp_needed_to_next_level:
            break
        total_xp += xp_needed_to_next_level
        level += 1
    return level, xp_needed_to_next_level