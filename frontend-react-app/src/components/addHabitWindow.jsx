import React from "react";
import { useState } from "react";
import "./popUpStyles.css"

const AddHabitWindow = (props) => {
    const [ resettingTimes, setResettingTimes ] = useState([])
    const [ habitName, setHabitName ] = useState("")
    const [ habitsDesc, setHabitDesc ] = useState("")

    const [ resetHours, setResetHours ] = useState("")
    const [ resetMinutes, setResetMinutes ] = useState("")

    const formatResetTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);

        return `${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        props.toggle();
    };

    const resetTimeAdding = (e) => {
    e.preventDefault();
    if (
        resetHours >= 0 && resetHours <= 24 &&
        resetMinutes >= 0 && resetMinutes <= 60
    ) {
        const resetAtUnix = ((resetHours * 60) * 60) + (resetMinutes * 60);

        const curentResetArray = [...resettingTimes];
        curentResetArray.push(resetAtUnix);

        setResettingTimes(curentResetArray);
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
                                    if(value >= 0 && value <= 60) {
                                        setResetMinutes(String(e.target.value));
                                    };
                                }}
                                min="0"
                                max="60"/>
                        </label>
                        <button onClick={resetTimeAdding}>Add</button>
                    </div>

                </form>
                <label>Reset daily at:</label>
                <ul>
                    {resettingTimes.map((time, index) => (
                        <li key={index}>
                            <span>{formatResetTime(time)}</span>
                        </li>
                    ))}
                </ul>

                <button onClick={() => props.toggle()}>Close</button>
            </div>
        </div>
    );
};

export default AddHabitWindow;