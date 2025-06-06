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
import { defineCookiesToken } from "../utils/cookieHandling";
import { defineColorTheme } from "../utils/cookieHandling";

export const Habits = () => {
    const [token, setToken] = defineCookiesToken();
    const [ darkTheme, toggleTheme ] = defineColorTheme();

    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [refreshHabits, setRefreshHabits] = useState(false);
    const [loading, setLoading] = useState(false);

    const [ UNIXFromMidnight, setUNIXFromMidnight ] = useState(null);

    const [ habitsNumber, setHabitsNumber ] = useState(null);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                setLoading(true);
                
                try {
                    const response = await fetchGetUNIXFromMidnight(token);
                    const responseJSON = await response.json();
                    const errorFlag = handleResponseError(response, responseJSON, navigate, setToken);
                    if(errorFlag) { return };
                    setUNIXFromMidnight(responseJSON.UNIX_time);
                } catch (err) {
                    console.error(err);
                    navigate("/internal-server-error", { state: {errorMessage: "Server down. Please, try again later"}});
                    return;
                }

                try {
                    const response = await fetchGetHabits(token);
                    const responseJSON = await response.json();
                    const errorFlag = handleResponseError(response, responseJSON, navigate, setToken);
                    if(errorFlag) { return };

                    let updatedDataWithResetAt = []
                    for(let i = 0; i < responseJSON.length; i++) {
                        let habit = responseJSON[i];
                        const timeString = await getClosestResetTime(habit.reset_at, habit.completed);
                        habit.resetAt = timeString;
                        updatedDataWithResetAt.push(habit);
                        setHabitsNumber(i + 1); // updating current length of habits
                    };

                    setHabits(updatedDataWithResetAt);
                } catch (err) {
                    console.error(err);
                    navigate("/internal-server-error", { state: {errorMessage: "Server down. Please, try again later"}});
                    return;
                };
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, [refreshHabits, navigate]);

    const checkboxHandler = async (e, habitID, index) => {
        const updatedHabits = [...habits];

        updatedHabits[index].completed = !updatedHabits[index].completed
        setHabits(updatedHabits)
        try {
            if(e.target.checked) {
                const response = await fetchHabitCompletion(habitID, token);
                const responseJSON = await response.json();
                const errorFlag = handleResponseError(response, responseJSON, navigate, setToken);
                if(errorFlag) { return };
            } else {
                const response = await fetchUncompleteHabit(habitID, token);
                const responseJSON = await response.json();
                const errorFlag = handleResponseError(response, responseJSON, navigate, setToken);
                if(errorFlag) { return };
            };            
        } catch (err) {
            console.error(err);
            navigate("/internal-server-error", {  state: {errorMessage: "Server down, try again later. "} });
            return;
        };
    };

    const getClosestResetTime = async (resetAt, completed) => {
        try {
            let requiredWindow = null;
            let resetAtKeys = Object.keys(resetAt);
            resetAtKeys = resetAtKeys.sort()
            for(let i = 0; i < resetAtKeys.length; i++) {
                let currentWindow = resetAtKeys[i];
                if(UNIXFromMidnight < Number(currentWindow)) {
                    requiredWindow = currentWindow;
                    break;
                };
            };
            if(!requiredWindow) {
                if(completed) {
                    return "You're all done! Check your habits tomorrow.";
                } else {
                    return "No more resets until tomorrow.";
                };
            };
            return minutesToReset(requiredWindow, UNIXFromMidnight);
            } catch (err) {
                console.error(err);
                navigate("/internal-server-error", { state: {  } });
            };
        };

    if(token) { 
        return (   
            <div>
                <NavBar />
                <section className="bg-white dark:bg-gray-900 min-h-screen">
                    <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-12">
                        <div className="flex justify-center mb-8 gap-5">
                            {habitsNumber < 10 && <AddHabitButton loadHabits={refreshHabits} setLoadHabits={setRefreshHabits}/>}
                            <button
                                className="py-2 px-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
                                onClick={() => setRefreshHabits(!refreshHabits)}
                            >
                                Reload Habits
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p className="text-4xl font-bold text-gray-800 dark:text-white">Loading...</p>
                                </div>
                            ) : habits.length === 0 ? (
                                <h3 className="text-gray-500 text-xl text-center">No habits added yet</h3>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    {habits.map((habit, index) =>
                                        habit && (
                                            <div key={index}>
                                            <div
                                                key={habit.habit_id}
                                                className="bg-gray-50 dark:bg-slate-900 rounded-2xl shadow p-6 flex flex-col justify-between w-full h-auto transition-colors duration-500 hover:scale-105 hover:shadow-2xl border border-gray-200 dark:border-slate-600"
                                            >
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2 truncate text-gray-900 dark:text-white">{habit.habit_name}</h3>
                                                    <p className="text-base mb-2 break-words text-gray-700 dark:text-white">{habit.habit_desc}</p>
                                                    <p className="text-xs text-blue-700 dark:text-blue-400">{habit.resetAt}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <label className="flex items-center space-x-2 text-sm select-none cursor-pointer">
                                                        <span className="text-black dark:text-white ">Mark as completed:</span>
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
                                                </div>
                                                <div>
                                                    <DeleteHabit setHabits={setHabits} habit={habit} habits={habits} index={index} setHabitsNumber={setHabitsNumber} habitsNumber={habitsNumber} />
                                                </div>
                                            </div>
                                        </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
    );
    } else {
        navigate("/login");
    }
};