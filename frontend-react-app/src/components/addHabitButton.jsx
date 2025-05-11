import React from "react";
import { useContext, useState } from "react";
import tokenContext from "../tokenContext";
import { fetchAddHabit } from "../api_fetching/urlParserMainFucntionality"
import AddHabitWindow from "./addHabitWindow"

const AddHabitButton = () => {
    const [ seen, setSeen ] = useState(false);

    const togglePop = (e) => {
        console.log("SET SEEN")
        setSeen(!seen);
    };

    return(
        <div>
            <button onClick={togglePop}>Add habit</button>
            {seen ? <AddHabitWindow toggle={togglePop} /> : null}
        </div>
    );
};

export default AddHabitButton;