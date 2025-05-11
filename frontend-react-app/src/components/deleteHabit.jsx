import React, { useContext } from "react";
import { useState } from "react";
import { TokenContext } from "../tokenContext";
import { fetchDeleteHabit } from "../api_fetching/urlParserMainFucntionality";
import "./confirm-modal.css"
import { useNavigate } from "react-router";

const DeleteHabit = (props) => {
    const navigate = useNavigate()
    const [ token, setToken ] = useContext(TokenContext);
    const [pop, setPop] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();

        const response = await fetchDeleteHabit(props.habit.habit_id, token);
        
        if(!response.ok) {
            const responseJSON = await response.json();
            console.error(responseJSON.detail);

            if(response.status == 401) {
                navigate("/login");
            };
            navigate("/internal-server-error");
        };
        const updatedHabits = [...props.habits];
        delete updatedHabits[props.index];
        props.setHabits(updatedHabits);
        setPop(false);
    };

    return(
        <div>
            <button className="confirm-delete-btn" type="confirm" onClick={() => setPop(!pop)}>Delete</button>

            {pop && ( 
                <div className="confirm-delete-overlay">
                    <div className="confirm-delete-modal">
                        <h2 className="confirm-delete-modal-title">Are you sure you want to delete:</h2>
                        <div className="FUTURE HABIT CARD">
                            <h4 className="confirm-delete-modal-text">
                                {props.habit.habit_name}
                            </h4>
                            <p className="confirm-delete-modal-text">
                                {props.habit.habit_desc}
                            </p>
                        </div>
                        <button onClick={handleDelete} className="confirm-delete-btn confirm">Delete</button>
                        <button onClick={() => setPop(false)} className="confirm-delete-btn cancel">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
    
};

export default DeleteHabit;