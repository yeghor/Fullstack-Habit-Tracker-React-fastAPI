import React, { use } from "react";
import {
    loginURL,
    registerURL,
    logoutURL,
    changePasswordURL,
    changeUsernameURL,
    } from "./urls";

export async function fetchChangePassword(newPassword, token) {
    const response = fetch(changePasswordURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "token": "Bearer " + token
        },
        body: JSON.stringify(newPassword)
    });
    return response;
};

export async function fetchChangeUsername(newUsername, token) {
    const response = fetch(changeUsernameURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "token": "Bearer " + token
        },
        body: JSON.stringify(newUsername)
    });
    return response;
};

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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "token": "Bearer " + token
        })
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