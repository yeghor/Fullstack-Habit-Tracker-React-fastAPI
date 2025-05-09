import {
    addHabitURL,
    getHabitsURL,
    habitCompletionURL,
    deleteHabitURL,
    getHabitCompletionsURL,
    getUserProfileURL
} from "./urls";

export const fetchGetUserProfile = async (token) => {
    const response = await fetch(getUserProfileURL, {
        method: "GET",
        headers: {
            "token": "Bearer " + token
        }
    });
    return response;
};

export const fetchGetHabits = async (token) => {
    const response = await fetch(getHabitsURL, {
        method: "GET",
        headers: {
            "token": "Bearer " + token
        },
    });
    return response;
};

export const fetchAddHabit = async (habitName, habitDesc, resetAt, token) => {
    const response = await fetch(addHabitURL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "token": "Bearer " + token
        },
        body: JSON.stringify({
            "habit_name": habitName,
            "habit_desc": habitDesc,
            "reset_at": resetAt
        })
    });
    return response
};

export const fetchHabitCompletion = async (habitID, token) => {
    const response = await fetch(habitCompletionURL, {
        method: "POST",
        headers: {
            "habit-id": habitID,
            "token": "Bearer " + token
        }
    });
    return response
};

export const fetchDeleteHabit = async (habitID, token) => {
    const response = await fetch(deleteHabitURL, {
        method: "POST",
        headers: {
            "habit-id": habitID,
            "token": "Bearer " + token
        }
    });
    return response
};

export const fetchGetHabitCompletion = async (habitID, token) => {
    const response = await fetch(getHabitCompletionsURL, {
        method: "GET",
        headers: {
            "habit-id": habitID,
            "token": "Bearer " + token
        },
    });
    return response;
};