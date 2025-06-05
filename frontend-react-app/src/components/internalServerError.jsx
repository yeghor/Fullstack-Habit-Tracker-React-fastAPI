import React from "react";
import { Link } from "react-router";
import { useLocation } from "react-router";
import NavBar from "./navBar";

const InternalServerError = (props) => {
    const { state } = useLocation();
    const { errorMessage } = state;

    return(
        <div>
            <NavBar />
            <div className="flex justify-center items-center rounded-3xl shadow-xl my-16 mx-32 p-16">
                <div className="mx-8 text-black text-center dark:text-white grid grid-cols-1 gap-4">
                    <h1 className="text-4xl font-semibold">Internal Server Error</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Something went wrong. Please, notify us and try again later.</p>
                    <p className="text-xl text-gray-600"> <span className="font-semibold">Server:</span> {errorMessage}</p>
                    <div className="mt-8 text-center">
                        <Link to="/" className="flex grow justify-center font-semibold text-white bg-blue-600 rounded-lg p-2 hover:bg-blue-700">Go back</Link>
                    </div>  
                </div>
            </div>  
        </div>

    )
};

export default InternalServerError;