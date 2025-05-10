import React from "react";
import { useContext, useState } from "react";
import { fetchLogout } from "../../api_fetching/urlParserAuthorization";
import { TokenContext } from "../../tokenContext";
import { useNavigate } from "react-router";

const Logout = () => {
    const [token, setToken] = useContext(TokenContext);
    const navigate = useNavigate();

    const clickLogoutHandler = () => {
        fetchLogout(token, setToken);
        navigate("/")
    };

    return(
        <div>
            <button onClick={clickLogoutHandler}>Logout</button>
        </div>
    );
};

export default Logout;
