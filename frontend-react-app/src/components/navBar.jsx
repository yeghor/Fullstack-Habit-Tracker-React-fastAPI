import React from "react";
import Logout from "./authrorization/logout";
import { Habits } from "./habits";
import { Link } from "react-router";
import { useContext } from "react";
import { TokenContext } from "../tokenContext";

const NavBar = () => {
    const [token, setToken] = useContext(TokenContext); 

    if(token) {
        return(
            <nav>
                <p>NavBar</p>
                <Link to="/">Go Home</Link>
                <Link to="/user-profile">Profile</Link>
                <Logout/>
            </nav>
        );
    } else {
    return(
        <nav>
            <p>NavBar</p>
            <Link to="/">Go Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </nav>
    );
    };
};

export default NavBar;