import React from "react";
import { useContext, useState, useEffect } from "react";
import { TokenContext } from "../../tokenContext";
import { fetchLogin } from "../../api_fetching/urlParserAuthorization";
import {verifyUsernameLength, verifyEmail, verifyPasswordLength} from "../../utils/verifyData"
import { Link, useNavigate } from "react-router"
import { handleResponseError } from "../../utils/handleResponse";
import NavBar from "../navBar";
import { defineCookies } from "../../utils/cookieToken";

const Login = () => {
    const [ token, setToken ] = defineCookies();

    let navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target.closest('form');
        if (!form.checkValidity()) {
            form.reportValidity(); 
            return;
        }

        if(!verifyUsernameLength(username)) {
            setErrorMessage("Invalid username. Length must be from 3 to 50.");
            return
        } else if(!verifyPasswordLength(password)) {
            setErrorMessage("Password length must be at least 8.");
            return
        };

        try {
            const response = await fetchLogin(username, password);
            const responseJSON = await response.json();

            if(response.status == 401) {
                setErrorMessage("Invalid credentials.");
                return;
            };

            handleResponseError(response, responseJSON, navigate, setToken, null, "/");
            setToken(responseJSON.token);
        } catch (err) {
            console.error("Error while logging in ", err);
        };
    };

    return(
        <div>
            <NavBar />
            <div className="items-center flex justify-center ">
                <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <h5 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h5>
                        <div>
                            {errorMessage ? <p className="font-semibold text-red-600">{errorMessage}</p> : null}
                        </div>
                        <div>
                            <label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your username</label>
                            <input onChange={(e) => setUsername(e.target.value)} type="text" name="text" id="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Username" minLength="3" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                            <input onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" minLength="8" required />
                        </div>
                        <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login to your account</button>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            Not registered? <Link to="/register" href="#" className="text-blue-700 hover:underline dark:text-blue-500">Create account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;