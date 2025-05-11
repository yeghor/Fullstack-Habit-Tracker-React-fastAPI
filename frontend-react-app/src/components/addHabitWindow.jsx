import React from "react";
import { useState } from "react";
import "./popUpStyles.css"

const AddHabitWindow = (props) => {
    const [ resettingTimes, setResettingTimes ] = useState([])
    const [ habitName, setHabitName ] = useState("")
    const [ habitsDesc, setHabitDesc ] = useState("")

    const [ resetHours, setResetHours ] = useState("")
    const [ resetMinutes, setResetMinutes ] = useState("")

    const formatResetTime = (e, props) => {
        e.preventDefault();

        const hours = Math.floor(props.time / 3600);
        const minutes = Math.floor((props.time % 3600))

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        props.toggle();
    };

    const resetTimeAdding = (e) => {
        e.preventDefault();
        const resetAtUnix = ((resetHours * 60) * 60) + (resetMinutes * 60);

        const curentResetArray = [...resettingTimes];
        curentResetArray.push(resetAtUnix);

        setResettingTimes(curentResetArray);
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
                            <input type="text" 
                                    value={resetHours}
                                    placeholder="Hours (from 0 to 24)"
                                    onChange={(e) => setResetHours(e.target.value)}
                                    minLength="0"
                                    maxLength="24"
                                    required />

                            <input type="text"
                            value={resetMinutes}
                            placeholder="Minutes (from 0 to 60)"
                            onChange={(e) => setResetMinutes(e.target.value)}
                            minLength="0"
                            maxLength="60"/>
                        </label>
                        <button onClick={resetTimeAdding}>Add</button>
                    </div>

                </form>
                <ul>
                    {resettingTimes.map((time, index) => (
                        <li key={index}>
                            <span>{formatResetTime(e, time)}</span>
                        </li>
                    ))}
                </ul>

                <button onClick={() => props.toggle()}>Close</button>
            </div>
        </div>
    );
};

export default AddHabitWindow;