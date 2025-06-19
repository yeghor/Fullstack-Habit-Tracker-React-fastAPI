from models import Habits
import datetime


def reset_habit(habit: Habits = None) -> None:
    reset_time_strs: str = "3600 15000 12425 30000 75000 80000 90000"
    reset_time_arr = reset_time_strs.split(" ")

    today_date = datetime.datetime.today().date()
    midnight_unix = datetime.datetime.combine(
        today_date, datetime.datetime.min.time()).timestamp()
    current_time_unix = datetime.datetime.now().timestamp()

    difference_unix = round(current_time_unix - midnight_unix)

    differences = {}

    for index, update_unix in enumerate(reset_time_arr):
        difference = difference_unix - int(update_unix)
        if difference > 0:
            continue
        differences[index] = abs(difference)
    print(differences)
    if differences:
        min_index = min(differences, key=differences.get)
    else:
        return None
