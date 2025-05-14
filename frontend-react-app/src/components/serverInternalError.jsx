import React from "react";
import { Link } from "react-router";
import { useLocation } from "react-router";

const InternalServerError = (props) => {
    const { state } = useLocation();
    const { errorMessage } = state;

    return(
        <div>
            <h1>Internal Server Error :(</h1>
            <h2>Something went wrong, please. Try again later.</h2>
            <p>Server: {errorMessage}</p>
            <Link to={"/"}>Go back</Link>
        </div>
    )
};

export default InternalServerError;