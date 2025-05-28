import React from "react";
import { useState, useEffect } from "react";
import { defineCookies } from "../utils/cookieToken";
import { fetchGetAllCompletions, fetchGetHabitCompeltions } from "../api_fetching/urlParserMainFucntionality";
import { handleResponseError } from "../utils/handleResponse";
import { useNavigate } from "react-router";
import NavBar from "./navBar";

const HabitCompletions = () => {
    const [ token, setToken ] = defineCookies();

    const navigate = useNavigate();

    const [ allCompletions, setAllCompletions ] = useState([]);
    const [ reload, setReload ] = useState(false);

    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        const fetchAllCompletions = async () => {
            try {
                setLoading(true);
                let response = null;
                let responseJSON = null;

                try {
                    response = await fetchGetAllCompletions(token);
                    responseJSON = await response.json();

                    handleResponseError(response, responseJSON, navigate, setToken);
                    setAllCompletions(responseJSON);
                } catch(err) {
                    console.error(err);
                    navigate("/internal-server-error", { state: {errorMessage: "Server down. Please, try again later"}});
                    return;
                };                
            } finally {
                setLoading(false);
            }

        };
        fetchAllCompletions();
    }, [reload]);

    const formatUNIX = (UNIX) => {
        const date = new Date(UNIX * 1000);
        return `${date.getMonth().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}/${date.getDay().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`;
    };

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