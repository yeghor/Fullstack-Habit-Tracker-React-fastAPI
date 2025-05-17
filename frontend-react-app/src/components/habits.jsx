import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetHabits, fetchHabitCompletion, fetchUncompleteHabit } from "../api_fetching/urlParserMainFucntionality";
import { fetchGetUNIXFromMidnight } from "../api_fetching/urlParserUtils";
import { useNavigate } from "react-router-dom";
import NavBar from "./navBar"
import AddHabitButton from "./addHabitButton";
import DeleteHabit from "./deleteHabit";
import { minutesToReset } from "../utils/getTimeUntilReset";
import { handleResponseError } from "../utils/handleResponse";
import "../index.css"

export const Habits = () => {
    const navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [habits, setHabits] = useState([]);
    const [refreshHabits, setRefreshHabits] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchHabits = async () => {
            if(!token) {
                navigate("/register");
            };

            setLoading(true);
            try {
                const response = await fetchGetHabits(token);
                const responseJSON = await response.json();
                if(response.ok) {
                    let updatedDataWithResetAt = []
                    for(let i = 0; i < responseJSON.length; i++) {
                        let habit = responseJSON[i]
                        const timeString = await getClosestResetTime(habit.reset_at, habit.completed);
                        habit.resetAt = timeString;
                        updatedDataWithResetAt.push(habit)
                    };
                    setHabits(updatedDataWithResetAt);
                } else {
                    if(response.status === 401) {
                        navigate("/register")
                        return
                    } else {
                        handleResponseError(response, responseJSON, navigate)
                    }
                }
            } catch (err) {
                console.error("Error fetching habits:", err);
                navigate("/internal-server-error");
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, [refreshHabits, token, navigate, setToken]);

    const checkboxHandler = async (e, habitID, index) => {
        const updatedHabits = [...habits];

        updatedHabits[index].completed = !updatedHabits[index].completed
        setHabits(updatedHabits)

        if(e.target.checked) {
            const response = await fetchHabitCompletion(habitID, token);
            const responseJSON = await response.json();
            handleResponseError(response, responseJSON, navigate);
        } else {
            const response = await fetchUncompleteHabit(habitID, token);
            const responseJSON = await response.json();
            handleResponseError(response, responseJSON, navigate);
        };
    };

    const getClosestResetTime = async (resetAt, completed) => {
        const response = await fetchGetUNIXFromMidnight(token);
        const responseJSON = await response.json();

        handleResponseError(response, responseJSON, navigate);

        const UNIXFromMidnight = Number(responseJSON.UNIX_time);

        let requiredWindow = null;
        let resetAtKeys = Object.keys(resetAt);
        resetAtKeys = resetAtKeys.sort()
        for(let i = 0; i < resetAtKeys.length; i++) {
            let currentWindow = resetAtKeys[i];
            if(UNIXFromMidnight < Number(currentWindow)) {
                requiredWindow = currentWindow;
                break
            };
        };
        if(!requiredWindow) {
            if(completed) {
                return "You're all done! Check your habits tomorrow."
            } else {
                return "No more resets until tomorrow."
            };
        };
        return minutesToReset(requiredWindow, UNIXFromMidnight);
        };

    if(token) { 
        return (   
        <div>
            <NavBar />
            <main className="container mx-auto px-4 md:px-8 pt-6">
                <div className="flex justify-center mb-4 gap-5">
                    <AddHabitButton loadHabits={refreshHabits} setLoadHabits={setRefreshHabits} />
                    <button
                        className="py-2 px-4 load-button  bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
                        onClick={() => setRefreshHabits(!refreshHabits)}
                        >
                        Reload Habits
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-4xl font-bold">Loading...</p>
                    </div>
                ) : habits.length === 0 ? (
                    <h3>No habits added yet</h3>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {habits.map((habit, index) =>
                        habit && (
                        <div
                            key={habit.habit_id}
                            className="bg-whiterounded-2xl shadow-lg p-6 flex flex-col justify-between w-full h-64 transition-transform hover:scale-105 hover:shadow-2xl border border-gray-400 rounded-lg"
                        >
                            <div>
                            <h3 className="text-xl font-bold mb-2 truncate text-gray-900">{habit.habit_name}</h3>
                            <p className="text-base mb-4 break-words text-gray-700">{habit.habit_desc}</p>
                            <p className="text-xs mb-2 text-blue-700">{habit.resetAt}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center space-x-2 text-sm select-none cursor-pointer">
                                <span>Mark as completed:</span>
                                <span className="relative">
                                <input
                                    type="checkbox"
                                    checked={habit.completed}
                                    onChange={(e) => checkboxHandler(e, habit.habit_id, index)}
                                    className="peer appearance-none h-5 w-5 rounded-md border border-blue-400 bg-white checked:bg-blue-600 checked:border-blue-600 transition-colors duration-150 ease-in-out outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <svg
                                    className="pointer-events-none absolute left-0 top-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path d="M6 10l3 3l5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                </span>
                            </label>
                            <DeleteHabit setHabits={setHabits} habit={habit} habits={habits} index={index} />
                            </div>
                        </div>
                        )
                    )}
                    </div>
                )}
            </main>
        </div>
    );
    } else {
        navigate("/login");
        return null;
    }
};