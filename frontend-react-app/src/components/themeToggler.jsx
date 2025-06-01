import React from "react";
import { defineColorTheme } from "../utils/cookieHandling";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";

const ThemeToggler = () => {
    const [ darkTheme, toggleTheme ] = defineColorTheme();

    const handleToggleTheme = () => {
        document.documentElement.classList.toggle("dark");
        toggleTheme();
    }

    return(
        <div className="absolute bottom-4 right-4">
            <div onClick={() => handleToggleTheme()} className="w-24 flex justify-center align-middle p-2 h-24 shadow-lg rounded-xl ">
                {darkTheme ? 
                    <button><IoSunny /></button>
                    : <button><IoMoon /></button>}
            </div>
        </div>
    );
};

export default ThemeToggler;