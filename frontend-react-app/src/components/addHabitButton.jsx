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
            <button className="py-2 px-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition" onClick={togglePop}>Add habit</button>
            {seen ? <AddHabitWindow toggle={togglePop}
                                    loadHabits={props.loadHabits}
                                    setLoadHabits={props.setLoadHabits}/>
            : null}
        </div>
    );
};

export default AddHabitButton;