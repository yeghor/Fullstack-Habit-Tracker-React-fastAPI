import React from "react";
import { useContext, useState } from "react";
import tokenContext from "../tokenContext";
import { fetchAddHabit } from "../api_fetching/urlParserMainFucntionality"
import AddHabitWindow from "./addHabitWindow"
import "../index.css"


const AddHabitButton = (props) => {
    const [ seen, setSeen ] = useState(false);

    const togglePop = (e) => {
        setSeen(!seen);
    };

    return(
        <div>
            <button className="text-white bg-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition" onClick={togglePop}>Add habit</button>
            {seen ? <AddHabitWindow toggle={togglePop}
                                    loadHabits={props.loadHabits}
                                    setLoadHabits={props.setLoadHabits}/>
            : null}
        </div>
    );
};

export default AddHabitButton;