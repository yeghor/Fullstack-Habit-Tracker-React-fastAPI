import React, { useEffect } from "react";
import Logout from "./authrorization/logout";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { TokenContext } from "../tokenContext";
import Login from "./authrorization/login.jsx"
import Register from "./authrorization/register.jsx"
import { defineColorTheme, defineCookiesToken } from "../utils/cookieHandling.js";

const NavBar = () => {
    const [token, setToken] = defineCookiesToken();
    const [ darkTheme, setDarkTheme ] = defineColorTheme();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkTheme)
    });

    return(
        <div>
        <nav>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <Link to="/" className="flex items-center justify-between rtl:space-x-reverse">
                <img src="/logotype.png" className="h-8" alt="Logo pic" />
                <span className="self-center text-2xl text-gray-800 font-semibold whitespace-nowrap dark:text-white">Home</span>
            </Link>
            <div className="block w-full md:block md:w-auto" id="navbar-default">
                <ul className="font-semibold flex flex-col md:flex-row p-4 mt-4 gap-4">
                <li>
                    <Link
                    to="/habits"
                    className="inline-block py-2 px-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition">Habits</Link>
                </li>
                {token ? 
                    <>
                        <li>
                            <Link
                            to="/habit_completions/1"
                            className="inline-block py-2 px-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition">Completions</Link>
                        </li>
                        <li>
                            <Link className="inline-block py-2 px-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition " to="/user-profile">Profile</Link> 
                        </li>                      
                        <li>
                            <Logout />
                        </li>
                    </>
                :
                <>
                    <li>
                        <Link className="block py-2 px-3 text-black dark:text-white" to="/login">Login</Link>
                    </li>
                    <li>
                        <Link className="block py-2 px-3 text-black dark:text-white" to="/register">Register</Link>
                    </li>  
                </>
                }      
                </ul>
            </div>
            </div>
        </nav>
        </div>
    );
};

export default NavBar;