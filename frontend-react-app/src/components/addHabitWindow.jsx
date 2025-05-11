import React from "react";
import { useState, useContext } from "react";
import "./addHabitPop.css"
import { fetchAddHabit } from "../api_fetching/urlParserMainFucntionality";
import { TokenContext } from "../tokenContext";
import { useNavigate } from "react-router";

const AddHabitWindow = (props) => {
    const navigate = useNavigate();
    const [ resetTimeArray, setResettingTimes ] = useState([]);
    const [ habitName, setHabitName ] = useState("");
    const [ habitsDesc, setHabitDesc ] = useState("");

    const [ token, setToken ] = useContext(TokenContext);

    const [ resetHours, setResetHours ] = useState(Number);
    const [ resetMinutes, setResetMinutes ] = useState(Number);

    const [ timeErrorMessage, setTimeErrorMessage ] = useState(null);

    const formatResetTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);

        return `${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
    };

    const deleteResetTime = (index) => {
        const updatedResetArray = [...resetTimeArray.slice(0, index), ...resetTimeArray.slice(index + 1)];
        setResettingTimes(updatedResetArray);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetchAddHabit(habitName, habitsDesc, resetTimeArray, token);
            if(!response.ok) {
                const responseJSON = await response.json();
                console.error(responseJSON.detail);
                navigate("/internal-server-error");
            }
            props.setLoadHabits(!props.loadHabits);
        } catch(err) {
            console.error(err)
            navigate("/internal-server-error");
        }

        props.toggle();
    };

    const resetTimeAdding = (e) => {
    e.preventDefault();
    if (
        resetHours >= 0 && resetHours <= 24 &&
        resetMinutes >= 0 && resetMinutes <= 59
    ) {
        

        const resetAtUnix = ((resetHours * 60) * 60) + (resetMinutes * 60);

        if(resetTimeArray.includes(resetAtUnix)) {
            setTimeErrorMessage("You're already added this resetting time!")
            return
        } 
        setTimeErrorMessage(null)

        const updatedResetArray = [...resetTimeArray];
        updatedResetArray.push(resetAtUnix);

        setResettingTimes(updatedResetArray);
    } else {
        alert("Enter Correct time!");
    };
    };

    return(
        <div className="popup">
            <div className="popup-inner">
                <h2>Add habit:</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                required/>
                    </label>
                    <label>
                        Description:
                        <input type="text"
                                value={habitsDesc}
                                onChange={(e) => setHabitDesc(e.target.value)}
                                required/>
                    </label>
                    <div>
                        <label>
                            Resetting time, 24 hours:

                            {timeErrorMessage ? 
                                <p>{timeErrorMessage}</p>
                            : null}

                            <input type="number" 
                                    value={resetHours}
                                    placeholder="Hours (from 0 to 24)"
                                    onChange={e => {
                                        const value = Number(e.target.value);
                                        if(value >= 0 && value <= 24) {
                                            setResetHours(String(e.target.value));
                                        };
                                    }}
                                    min="0"
                                    max="24"
                                    required />

                            <input type="number"
                                value={resetMinutes}
                                placeholder="Minutes (from 0 to 60)"
                                onChange={e => {
                                    const value = Number(e.target.value);
                                    if(value >= 0 && value <= 59) {
                                        setResetMinutes(String(e.target.value));
                                    };
                                }}
                                min="0"
                                max="60"/>
                        </label>
                        <button type="button" onClick={resetTimeAdding}>Add</button>
                    </div>
                    <button type="submit">Submit</button>
                </form>
                <div className="info-block">
                    <label>Reset daily at:</label>
                    <ul className="resetting-times-list">
                        {resetTimeArray.map((time, index) => (
                        <li className="resetting-times-item" key={index}>
                        <span>{formatResetTime(time)}</span>
                        <button className="close-btn" aria-label="Close" onClick={() => deleteResetTime(index)} />
                    </li>
                    ))}
                </ul>
                </div>
                <button onClick={() => props.toggle()}>Close</button>
            </div>
        </div>
    );
};

export default AddHabitWindow;