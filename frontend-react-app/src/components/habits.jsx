import React, { useState } from "react";
import { useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetHabits } from "../api_fetching/urlParserMainFucntionality";
import { useNavigate } from "react-router-dom";


export const Habits = () => {
    const navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [habits, setHabits] = useState([]);

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
                    console.log(data)
                    setHabits(data)
            } catch (err) {
                navigate("/server-internal-error")
            }}
        };
        loadHabits();

    }, []);



    if(token) { 
        return(
            <div>
                <p>test</p>
                <h2>dasdasd</h2>
                <ul>
                    {habits.map((habit, index) => (
                        <li key={index}>
                            <h3>{habit.habit_name}</h3>
                            <p>{habit.habit_desc}</p>
                            <p>Time of resetting: 
                                {Object.keys(habit.reset_at).map((key) => (
                                <span key={key}>{key}, </span>
                                ))}
                            </p>
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

