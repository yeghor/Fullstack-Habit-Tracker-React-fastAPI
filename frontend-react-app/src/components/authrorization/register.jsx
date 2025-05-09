import React from "react";
import { useContext, useState, useEffect } from "react";
import { TokenContext } from "../../tokenContext";
import { fetchRegister } from "../../api_fetching/urlParserAuthorization";
import {verifyUsernameLength, verifyEmail, verifyPasswordLength} from "../../utils/verifyData"
import { useNavigate } from "react-router"

const Register = () => {
    let navigate = useNavigate();
    const [token, setToken] = useContext(TokenContext);
    const [errorMessage, setErrorMessage] = useState(null);

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [email, setEmail] = useState(null)

    const handleRegister = async (event) => {
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
            const response = await fetchRegister(username, password, email)
            if(!response.ok) {
                const responseJSON = await response.json()
                setErrorMessage(responseJSON.detail);
                return;
            };

            const data = await response.json();
        
            setToken(data.token);
            navigate("/")
        } catch (err) {
            setErrorMessage(err)
            console.error("Error while trying to register ", err);
        };
    };

    return(
        <div>
            <h1>Fill up the blanks</h1>
            <p>{errorMessage ? errorMessage : ""}</p>
            <form onSubmit={handleRegister}>
                <input onChange={(e) => {setUsername(e.target.value)}} type="text" placeholder="Username" required/>
                <input onChange={(e) => {setPassword(e.target.value)}} type="password" placeholder="Password" required/>
                <input onChange={(e) => {setEmail(e.target.value)}} type="email" placeholder="Email" required/>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;