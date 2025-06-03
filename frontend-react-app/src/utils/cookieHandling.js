import Cookies from "universal-cookie";
import { cookieExpiresSeconds } from "../consts";

export const defineCookiesToken = () => {
    const cookies = new Cookies();

    const token = cookies.get("token");
    const setToken = (newToken) => {
        const now = new Date();
        if(newToken) {
            cookies.set("token", newToken, {
                expires: new Date(now.getTime() + ((Number(cookieExpiresSeconds) || 3600) * 1000)),
            });            
        } else {
            cookies.remove("token");
        };
    };
    return [token, setToken];
};

export const defineColorTheme = () => {
    const cookies = new Cookies();

    const darkTheme = cookies.get('darkTheme');
    if(!darkTheme) {
        cookies.set("darkTheme", false);
        cookies.get(darkTheme);
    };
    const toggleTheme = () => {
        let darkTheme = cookies.get("darkTheme");
        // if(!darkTheme) { darkTheme = false };
        cookies.set("darkTheme", !darkTheme);
    };

    return [ darkTheme, toggleTheme ];
};