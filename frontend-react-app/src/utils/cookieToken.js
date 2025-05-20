import Cookies from "universal-cookie";
import { cookieExpiresSeconds } from "../consts";

export const defineCookies = () => {
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