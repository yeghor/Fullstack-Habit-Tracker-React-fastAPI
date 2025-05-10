import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetHabits, fetchHabitCompletion } from "../api_fetching/urlParserMainFucntionality";
import { useNavigate } from "react-router-dom";


export const Habits = () => {
    const navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [habits, setHabits] = useState([]);
    const [checkBoxes, setCheckBoxes] = useState({})
    const [completed, setCompleted] = useState(false)
    const [loadHabits, setLoadHabits] = useState(false)

    useEffect(() => {
        const loadHabits = async () => {
            if(token) {
                try {
                    const response = await fetchGetHabits(token);

                    if(!response.ok) {
                        if(response.status === 401) {
                            setToken();
                            navigate("/login-timeout");
                        };
                        navigate("/server-internal-error")
                    };

                    const data = await response.json();
                    console.log(data);
                    setHabits(data);

                    const initialCheckBoxes = {};
                    for(let i = 0; i < data.length; i++ ) {
                        let habit = data[i];
                        initialCheckBoxes[habit.habit_id] = habit.completed;
                    };
                    setCheckBoxes(initialCheckBoxes);
                } catch (err) {
                    navigate("/server-internal-error");
                };
            };
        };
        loadHabits();

    }, [loadHabits]);

    const checkboxHandler = async (e, habitID) => {
        if(e.target.checked) {

            const response = await fetchHabitCompletion(habitID, token);
            if(!response.ok) {
                if(response.status == 401) {
                    navigate("/login-timeout");
                } else if(response.status == 409) {
                    setLoadHabits(!loadHabits)
                    return
                }
                navigate("/server-internal-error");
            };

            setCheckBoxes((current) => current.habitID = true)
            setLoadHabits(!loadHabits)

        } else {
            
        }
    }

    if(token) { 
        return(
            <div>
                <p>test</p>
                <h2>dasdasd</h2>
                <ul>
                    {habits.map((habit, index) => (
                        <li key={index}>
                            <h3>{habit.habit_name}</h3>
                            <p>Index: {index}</p>
                            <p>{habit.habit_desc}</p>
                            <p>Time of resetting: 
                                {Object.keys(habit.reset_at).map((key) => (
                                <span key={key}>{key}, </span>
                                ))}
                            </p>
                            <label>
                                Mark as completed:
                                <input
                                    type="checkbox"
                                    checked={habit.completed}
                                    onChange={(e) => checkboxHandler(e, habit.habit_id)}/>
                            </label>
                            
                        </li>
                    ))}
                </ul>
            </div>
        );
    } else {
        return(
            <div>Not Logged in</div>
        );
    };
};

