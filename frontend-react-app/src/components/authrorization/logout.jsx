import React from "react";
import { useContext, useState } from "react";
import { fetchLogout } from "../../api_fetching/urlParserAuthorization";
import { TokenContext } from "../../tokenContext";
import { useNavigate } from "react-router";
import { handleResponseError } from "../../utils/handleResponse";
import { defineCookies } from "../../utils/cookieToken";

const Logout = () => {
    const [token, setToken] = defineCookies();
    const navigate = useNavigate();

    const clickLogoutHandler = () => {
        const logout = async () => {
            try {
                await fetchLogout(token, setToken);
                setToken();
                navigate("/register")                
            } catch(err) {
                console.error(err);
                navigate("/internal-server-error", { state: {errorMessage: "Server down. Please, try again later"}});
                return;
            };

        };
        logout();      
    };

    return(
        <div>
            <button className="block py-2 px-3 text-black" onClick={clickLogoutHandler}>Logout</button>
        </div>
    );
};

export default Logout;
