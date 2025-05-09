import React from "react";
import { useContext, useState } from "react";
import { fetchLogout } from "../../api_fetching/urlParserAuthorization";
import { TokenContext } from "../../tokenContext";

const Logout = () => {
    const [token, setToken] = useContext(TokenContext);

    const clickLogoutHandler = () => {
        fetchLogout(token, setToken);
    };

    return(
        <div>
            <button onClick={clickLogoutHandler}>Logout</button>
        </div>
    );
};

export default Logout;
