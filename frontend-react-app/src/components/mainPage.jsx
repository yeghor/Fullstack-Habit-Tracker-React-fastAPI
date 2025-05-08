import React from "react";
import { fetchLogin, fetchRegister, fetchLogout } from "../api_fetching/urlParser";
import { useState, useEffect, useContext } from "react";  
import { TokenContext } from "../tokenContext";
import { Link } from "react-router-dom";

function MainPage() {
    const [token, setToken] = useContext(TokenContext);

    useEffect(() => {
        console.log(token)
        console.log("Rerender. User logined or loaded this page")
    }, [token]);

    const loginHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get("username");
        const password = formData.get("password");
        const email = formData.get("email");
        await fetchLogin(username, password, email, setToken);
    };

    const logoutHandler = () => {
        console.log("Logging out (trying to clear token)");
        fetchLogout(token, setToken);
    };

    if(token) {
        return (
        <div>
            <h1>Hello, {token}. Let's move to your habits!</h1>
            <a href="/habits">Go to habits</a>
            <button onClick={logoutHandler}>Logout</button>
        </div>
    );
    } else {
        return (
            <div>
                <h1>To start using our app, please, login.</h1>
                <Link to="/login">Log-in</Link>
            </div>
        );
    };
};


export default MainPage;