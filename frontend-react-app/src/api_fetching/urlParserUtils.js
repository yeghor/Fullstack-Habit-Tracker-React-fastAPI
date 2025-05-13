import { getUNIXFromMidnightURL } from "./urls";

export const fetchGetUNIXFromMidnight = async (token) => {
    const response = await fetch(getUNIXFromMidnightURL, {
        method: "GET",
        headers: {
            "accept": "application/json",
            "token": "Bearer " + token
        }
    });
    return response;
};