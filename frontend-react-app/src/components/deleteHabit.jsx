import React, { useContext } from "react";
import { useState } from "react";
import { TokenContext } from "../tokenContext";
import { fetchDeleteHabit } from "../api_fetching/urlParserMainFucntionality";
import "../index.css"
import { useNavigate } from "react-router";
import { handleResponseError } from "../utils/handleResponse";
import { defineCookies } from "../utils/cookieToken";

const DeleteHabit = (props) => {
    const [token, setToken] = defineCookies();

    const navigate = useNavigate()
    const [pop, setPop] = useState(false);
    const habit = props.habit

    const handleDelete = async (e) => {
        e.preventDefault();

        const response = await fetchDeleteHabit(props.habit.habit_id, token);
        const reponseJSON = response.json();

        handleResponseError(response, reponseJSON, navigate, setToken);
        

        let updatedHabits = [...props.habits];
        delete updatedHabits[props.index];
        props.setHabits(updatedHabits);
        setPop(false);
    };

    return(
    <div className="relative inline-block">
      <button
        className="m-2 px-2 py-1 bg-gray-500 text-white rounded hover:bg-red-600 transition"
        type="button"
        onClick={() => setPop(!pop)}
      >
        Delete
      </button>

      {pop && (
        <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-64 p-4 animate-fadeIn">
            <h2 className="text-base font-bold text-gray-800 mb-2 text-center">
                Are you sure you want to delete:
            </h2>
            <div className="mb-2 rounded bg-gray-100 p-2">
                <h4 className="font-semibold text-gray-700 text-center text-sm">
                    {habit.habit_name}
            </h4>
            <p className="text-gray-600 text-center text-xs">{habit.habit_desc}</p>
        </div>
            <div className="flex gap-2 mt-2">
            <button
              onClick={handleDelete}
              className="flex-1 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition text-sm"
            >
                 Delete
            </button>
            <button
                onClick={() => setPop(false)}
                className="flex-1 py-1 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition text-sm"
            >
                Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    )
    
};

export default DeleteHabit;