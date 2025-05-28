const BASE_URL = "http://127.0.0.1:8000"

// AUTHORIZATION
export const testURL = BASE_URL;
export const loginURL = `${BASE_URL}/login`;
export const registerURL = `${BASE_URL}/register`;
export const logoutURL = `${BASE_URL}/logout`;
export const getUserProfileURL = `${BASE_URL}/get_user_profile`;
export const changeUsernameURL = `${BASE_URL}/change_username`;
export const changePasswordURL = `${BASE_URL}/change_password`;
export const checkTokenExpiery = `${BASE_URL}/check_token`;

// MAIN FUNCTIONALITY
export const addHabitURL = `${BASE_URL}/add_habit`;
export const getHabitsURL = `${BASE_URL}/get_habits`;
export const habitCompletionURL = `${BASE_URL}/habit_completion`;
export const deleteHabitURL = `${BASE_URL}/delete_habit`;
export const getHabitCompletionsURL = `${BASE_URL}/get_habit_completions`;
export const getAllCompletionsURL = `${BASE_URL}/get_all_completions`;
export const uncompleteHabitURL = `${BASE_URL}/uncomplete_habit`;

export const getUNIXFromMidnightURL = `${BASE_URL}/get_UNIX_from_midnight`;