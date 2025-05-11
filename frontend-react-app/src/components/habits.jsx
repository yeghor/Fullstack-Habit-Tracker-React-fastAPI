import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetHabits, fetchHabitCompletion, fetchUncompleteHabit } from "../api_fetching/urlParserMainFucntionality";
import { useNavigate } from "react-router-dom";
import NavBar from "./navBar"
import AddHabitButton from "./addHabitButton";

export const Habits = () => {
    const navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [habits, setHabits] = useState([]);
    const [loadHabits, setLoadHabits] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(!token) {
        navigate("/login");
        };

        const fetchHabits = async () => {
            setLoading(true);
            try {
                const response = await fetchGetHabits(token);

                if (!response.ok) {
                    if (response.status === 401) {
                        setToken();
                        navigate("/login");
                        return;
                    }
                    navigate("/internal-server-error");
                    return;
                }

                const data = await response.json();
                console.log(data);
                setHabits(data);
            } catch (err) {
                console.error("Error fetching habits:", err);
                navigate("/internal-server-error");
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, [loadHabits, token, navigate, setToken]);

    const checkboxHandler = async (e, habitID, index) => {
        const updatedHabits = [...habits];

        updatedHabits[index].completed = !updatedHabits[index].completed
        setHabits(updatedHabits)

        if(e.target.checked) {
            const response = await fetchHabitCompletion(habitID, token);

            if(!response.ok) {
                if(response.status == 401) {
                    navigate("/login-timeout");
                } else if(response.status == 409) {
                    return;
                }
                navigate("/internal-server-error");
            };

        } else {
            const response = await fetchUncompleteHabit(habitID, token);

            if(!response.ok) {
                if(response.status == 401) {
                    navigate("/login-timeout");
                };
                navigate("/");
            };
        };
    };

    if(token) { 
        return(
            <div>
                <NavBar />

                <h1>Your Habits</h1>
                <AddHabitButton loadHabits={loadHabits} setLoadHabits={setLoadHabits}/>
                {loading ? <h3>Loading...</h3> : 
                    (habits.length === 0 ? <h3>No habits added yet</h3> :
                        <ul>
                            {habits.map((habit, index) => (
                                <li key={habit.habit_id}>
                                    <h3>{habit.habit_name}</h3>
                                    <p>Index: {index}</p>
                                    <p>{habit.habit_desc}</p>

                                    <label>
                                        Mark as completed:
                                        <input
                                            type="checkbox"
                                            checked={habit.completed}
                                            onChange={(e) => checkboxHandler(e, habit.habit_id, index)}/>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )
                }
            </div>
        );
    };
};

