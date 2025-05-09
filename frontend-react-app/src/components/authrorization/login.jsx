import React from "react";
import { useContext, useState, useEffect } from "react";
import { TokenContext } from "../../tokenContext";
import { fetchLogin } from "../../api_fetching/urlParserAuthorization";
import {verifyUsernameLength, verifyEmail, verifyPasswordLength} from "../../utils/verifyData"
import { useNavigate } from "react-router"

const Login = () => {
    let navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [errorMessage, setErrorMessage] = useState(null);

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [email, setEmail] = useState(null)

    const handleLogin = async (event) => {
        event.preventDefault();

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
            const response = await fetchLogin(username, password, email)
            
            if(!response.ok) {
                const responseJSON = await response.json()
                setErrorMessage(responseJSON.detail);
                return;
            };

            const data = await response.json();
        
            setToken(data.token);
            navigate("/")
        } catch (err) {
            console.error("Error while logging in ", err);
        };
    };

    return(
        <div>
            <h1>Fill up the blanks</h1>
            <p>{errorMessage ? errorMessage : ""}</p>
            <form onSubmit={handleLogin}>
                <input onChange={(e) => {setUsername(e.target.value)}} type="text" placeholder="Username" required/>
                <input onChange={(e) => {setPassword(e.target.value)}} type="password" placeholder="Password" required/>
                <input onChange={(e) => {setEmail(e.target.value)}} type="email" placeholder="Email" required/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;