import React from "react";
import { fetchLogin, fetchRegister, fetchLogout } from "./urlParser";
import { useState, useEffect, useContext } from "react";  
import { TokenContext } from "./tokenContext";

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
        const loginData = await fetchLogin(username, password, email);
        setToken(loginData.token);
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
            <button onClick={logoutHandler}>Logout (clear token)</button>
        </div>
    );
    } else {
        return (
            <div>
                <h1>To start using our app, please, login.</h1>
                <form onSubmit={loginHandler}>
                    <input type="text" placeholder="Username" name="username"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <input type="text" placeholder="Email" name="email"/>
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    };
};


export default MainPage;