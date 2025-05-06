import React from "react";
import { testURL, loginURL, registerURL } from "./urls";

export async function fetchTest() {
    try {
        const response = await fetch(testURL)
        if(!response.ok) {
            throw new Error(`Http Error! status: ${response.status}`);
        }
        console.log(response.status)
        const response_json = await response.json()
        return(<div>{response_json}</div>);
    } catch(error) {
        console.error(error);
        throw error;
    }
}

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
}

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
}