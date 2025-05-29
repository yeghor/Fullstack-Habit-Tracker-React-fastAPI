import React from "react";
import { useState, useEffect } from "react";
import { defineCookies } from "../utils/cookieToken";
import { fetchGetAllCompletions, fetchGetHabitCompeltions, fetchGetHabits } from "../api_fetching/urlParserMainFucntionality";
import { handleResponseError } from "../utils/handleResponse";
import { useNavigate } from "react-router";
import NavBar from "./navBar";
import { useParams } from "react-router-dom";

const HabitCompletions = () => {
    const id = useParams();

    const [ token, setToken ] = defineCookies();

    const navigate = useNavigate();

    const [ allCompletions, setAllCompletions ] = useState([]);
    const [ habits, setHabits ] = useState([]);
    const [ visibleCompletions, setVisibleCompletions ] = useState([])
    
    const [ reload, setReload ] = useState(false);

    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                let responseCompletions = null;
                let responseCompletionsJSON = null;
                let responseHabits = null;
                let responseHabitsJSON = null;  

                try {
                    responseCompletions = await fetchGetAllCompletions(token);
                    responseCompletionsJSON = await responseCompletions.json();
                    
                    responseHabits = await fetchGetHabits(token);
                    responseHabitsJSON = await responseHabits.json();
                    

                    handleResponseError(responseCompletions, responseCompletionsJSON, navigate, setToken);
                    handleResponseError(responseHabits, responseHabitsJSON, navigate, setToken);

                    console.log(responseCompletionsJSON)

                    setHabits(responseHabitsJSON);
                    setAllCompletions(responseCompletionsJSON);
                    setVisibleCompletions(responseCompletionsJSON)
                    
                } catch(err) {
                    console.error(err);
                    navigate("/internal-server-error", { state: {errorMessage: "Server down. Please, try again later"}});
                    return;
                };                
            } finally {
                setLoading(false);
            }

        };
        fetchAll();
    }, [reload]);

    const formatUNIX = (UNIX) => {
        const date = new Date(UNIX * 1000);
        return `${date.getMonth().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}/${date.getDay().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
    };

    const handleSortByHabit = () => {
        return
    }

    if(loading) {
        return(
            <div>
                <NavBar />

                <div className="w-full max-w-2xl mx-auto">
                    <p className="text-xl font-semibold text-center">Loading...</p>
                </div>                
            </div>

        )
    }

    return(
        <div>
            <NavBar />
            <div className="flex justify-center my-5">
                <p className="font-bold text-3xl">Your Completions</p>
            </div>
            <div className="flex justify-center">
                <div className="rounded-lg w-2/3 shadow-xl flex flex-wrap flex-row gap-3 p-2 justify-center">
                    { habits.map((habit) => {
                        return (
                            <button onClick={handleSortByHabit} className="p-2 text-white bg-blue-600 rounded-xl font-semibold hover:bg-blue-700">{habit.habit_name}</button>
                        )
                    }) }
                </div>                
            </div>

            <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
                {allCompletions.map((completion) => (
                    <div
                        key={completion.completion_id}
                        className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-lg font-semibold text-gray-800">
                                {completion.habit_name}
                            </div>
                            <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                                Completed: {formatUNIX(completion.completed_at)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HabitCompletions;