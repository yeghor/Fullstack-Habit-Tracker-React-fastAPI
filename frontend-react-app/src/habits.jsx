import React from "react";
import { useContext } from "react";
import { TokenContext } from "./tokenContext";

export const Habits = () => {
    const [token, setToken] = useContext(TokenContext)

    if(token) {
        return(
            <div>
                <h1>Habis page</h1>
                <a href="/">Go back</a>
            </div>
        );  
    } else {
        return(
            <div>
                <h1>You need to login</h1>
                <a href="/">Go back</a>
            </div>
            
        )
    };

};

