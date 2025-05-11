import React from "react";
import { useContext } from "react";  
import { TokenContext } from "../tokenContext";
import { Link } from "react-router-dom";
import NavBar from "./navBar";

function MainPage() {
    const [token, setToken] = useContext(TokenContext);

    if(token) {
        return (
            <div>
                <h1>{token}</h1>
                <NavBar />
                <h2>Hello. Begin using our app!</h2>
                <Link to="/habits">Go to habits</Link>
            </div>
        );
    } else {
        return (
            <div>
                <h1>{token}</h1>
                <NavBar />
                <h2>To start your journey. Please, Sign up</h2>
                <div>
                    <p>Already have an account?</p>
                    <Link to="/register">Register</Link>                    
                </div>
                <div>
                    <Link to="/login">Login</Link>
                </div>
            </div>
        );
    };
};


export default MainPage;