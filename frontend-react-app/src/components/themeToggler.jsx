import React, { useEffect, useState } from "react";
import { defineColorTheme } from "../utils/cookieHandling";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";

const ThemeToggler = () => {
    let [ darkTheme, toggleDarkTheme ] = defineColorTheme();
    const [ darkThemeState, setDarkThemeState ] = useState(darkTheme);

    const handleToggleTheme = () => {
        toggleDarkTheme();
        [ darkTheme, toggleDarkTheme ] = defineColorTheme();
        setDarkThemeState(!darkThemeState);
    };

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkThemeState);
        document.documentElement.classList.toggle("bg-gray-900", darkThemeState)
    }, [darkThemeState]);


    return(
        <div className="absolute bottom-4 right-4">
            <div onClick={() => handleToggleTheme()} className="w-24 flex justify-center align-middle p-2 h-24 shadow-lg rounded-xl dark:bg-slate-800 dark:shadow-slate-500/50">
                {darkTheme ? 
                    <button><IoSunny className="fill-slate-700 dark:fill-gray-100"/></button>
                    : <button><IoMoon  className="fill-slate-700 dark:fill-gray-100"/></button>}
            </div>
        </div>
    );
};

export default ThemeToggler;