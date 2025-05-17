import React from "react";
import { useContext, useState, useEffect } from "react";
import { TokenContext } from "../../tokenContext";
import { fetchRegister } from "../../api_fetching/urlParserAuthorization";
import {verifyUsernameLength, verifyEmail, verifyPasswordLength} from "../../utils/verifyData"
import { useNavigate } from "react-router"
import { handleResponseError } from "../../utils/handleResponse";
import NavBar from "../navBar";
import { Link } from "react-router-dom";

const Register = () => {
    let navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [errorMessage, setErrorMessage] = useState("");

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault();
        const form = e.target.closest('form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        if(!verifyUsernameLength(username)) {
            setErrorMessage("Invalid username. Length must be from 3 to 50.");
            return
        } else if(!verifyEmail(email)) {
            setErrorMessage("Invalid Email. Must Contain @ and .");
            return
        } else if(!verifyPasswordLength(password)) {
            setErrorMessage("Password length must be at least 8.");
            return
        };

        try {
            const response = await fetchRegister(username, password, email);
            const responseJSON = await response.json();

            if(response.status == 400) {
                setErrorMessage("Invalid username or email")
                return
            } else if(response.status == 409) {
                setErrorMessage("User with these credentials already exists.")
                return
            }

            handleResponseError(response, responseJSON, navigate, "/")
        
            setToken(responseJSON.token);
        } catch (err) {
            setErrorMessage(err)
            console.error("Error while trying to register ", err);
        };
    };

    return(
        <div>
            <NavBar />
            <div className="items-center flex justify-center ">
                <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <form className="space-y-6" action="#">
                        <h5 className="font-semibold text-xl m text-gray-900 dark:text-white">Sign in to our platform</h5>
                        <div>
                            {errorMessage ? <p className="font-semibold text-red-600">{errorMessage}</p> : null}
                        </div>
                        <div>
                            <label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your username</label>
                            <input onChange={(e) => setUsername(e.target.value)} type="text" name="text" id="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Username" minLength="3" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                            <input onChange={(e) => setEmail(e.target.value)} type="email" name="email" id="email" placeholder="email@gmail.com" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" minLength="3" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                            <input onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"minLength="8"  required />
                        </div>

                        <button onClick={handleRegister} type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Register a new account</button>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            Have an account? <Link to="/login" href="#" className="text-blue-700 hover:underline dark:text-blue-500">Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;