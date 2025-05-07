import React from "react";
import { loginURL, registerURL, logoutURL } from "./urls";

export async function fetchLogin(username, password, email) {
    const response = await fetch(loginURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "email": email
        }),
    });
    const data = await response.json();
    return data;
};

export async function fetchLogout(token, setToken) {
    const response = await fetch(logoutURL, {
        method: "POST",
        headers: {
            "token": "Bearer " + token
        }
    });
    if(!response.ok) {
        console.error("Error while trying to logout")
    } else{
        setToken()
    };
};

export async function fetchRegister(username, password, email) {
    const response = await fetch(registerURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "email": email
        }),
    });
    const data = await response.json();
    return data;
};