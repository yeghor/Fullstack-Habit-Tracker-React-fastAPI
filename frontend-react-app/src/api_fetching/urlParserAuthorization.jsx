import React, { use } from "react";
import { loginURL, registerURL, logoutURL } from "./urls";

export async function fetchLogin(username, password) {
    const response = await fetch(loginURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
        }),
    });
    return response
};

export async function fetchLogout(token, setToken) {
    const response = await fetch(logoutURL, {
        method: "POST",
        headers: {
            "token": "Bearer " + token
        }
    });
    if(!response.ok) {
        const errorData = await response.json();
        console.error(errorData.detail);
    };
    setToken();
};

export async function fetchRegister(username, password, email, setToken) {
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
    return response
};