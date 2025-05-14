import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetHabits, fetchHabitCompletion, fetchUncompleteHabit } from "../api_fetching/urlParserMainFucntionality";
import { fetchGetUNIXFromMidnight } from "../api_fetching/urlParserUtils";
import { useNavigate } from "react-router-dom";
import NavBar from "./navBar"
import AddHabitButton from "./addHabitButton";
import DeleteHabit from "./deleteHabit";
import "./habits-page.css"
import { minutesToReset } from "../utils/getTimeUntilReset";
import { handleResponseError } from "../utils/handleResponse";

export const Habits = () => {
    const navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [habits, setHabits] = useState([]);
    const [refreshHabits, setRefreshHabits] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(!token) {
        navigate("/login");
        };

        const fetchHabits = async () => {
            setLoading(true);
            try {
                const response = await fetchGetHabits(token);
                const responseJSON = await response.json();

                handleResponseError(response, responseJSON, navigate);

                let updatedDataWithResetAt = []
                for(let i = 0; i < responseJSON.length; i++) {
                    let habit = responseJSON[i]
                    const timeString = await getClosestResetTime(habit.reset_at, habit.completed);
                    habit.resetAt = timeString;
                    updatedDataWithResetAt.push(habit)
                };

                setHabits(updatedDataWithResetAt);
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
        console.log(requiredWindow)
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
        return(
            <div>
                <NavBar />

                <h1>Your Habits</h1>
                <AddHabitButton loadHabits={refreshHabits} setLoadHabits={setRefreshHabits}/>
                
                <div className="container">
                    <button className="load-button" onClick={() => setRefreshHabits(!refreshHabits)}>Reload Habits</button>
                </div>

                {loading ? <h3>Loading...</h3> : 
                    (habits.length === 0 ? <h3>No habits added yet</h3> :
                        <ul>
                            {habits.map((habit, index) => (
                                habit ? 
                                <li key={habit.habit_id}>
                                    <h3>{habit.habit_name}</h3>
                                    <p>Index: {index}</p>
                                    <p>{habit.habit_desc}</p>
                                    <p>Reset in: {habit.resetAt}</p>
                                    <label>
                                        Mark as completed:
                                        <input
                                            type="checkbox"
                                            checked={habit.completed}
                                            onChange={(e) => checkboxHandler(e, habit.habit_id, index)}/>
                                    </label>
                                    <DeleteHabit
                                        habit={habit}
                                        habits={habits}
                                        setHabits={setHabits}
                                        index={index}
                                    />
                                </li>
                            : null))}
                        </ul>
                    )
                }
            </div>
        );
    } else {
        navigate("/login")
    };
};