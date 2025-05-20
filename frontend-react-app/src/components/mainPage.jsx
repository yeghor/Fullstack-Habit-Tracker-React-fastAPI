import React from "react";
import { useContext } from "react";  
import { TokenContext } from "../tokenContext";
import { Link } from "react-router-dom";
import NavBar from "./navBar";
import "../index.css"
import { defineCookies } from "../utils/cookieToken";

function MainPage() {
    const [ token, setToken ] = defineCookies();
    console.log("token ", token)
    if(token) {
        return (
            <div>
                <NavBar />
                <div>
                    <section class="bg-white dark:bg-gray-900">
                        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
                            <a href="https://github.com/yeghor/Habit-Tracker-React-fastAPI" class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" role="alert">
                            <span class="text-sm font-medium">GitHub Repository page</span> 
                                <svg class="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            </a>
                            <h1 class="mb-4 text-4xl font-bold tracking-tight leading-none text-gray-800 md:text-5xl lg:text-6xl dark:text-white">Build better days with our <span className="font-black text-zinc-900">Habit Tracker</span></h1>
                            <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">We provide a convenient and safe interface for tracking habits and your own progress.</p>
                            <div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                                <a href="/habits" class="inline-flex justify-center items-center py-3 px-5 text-base font-semibold text-center text-white rounded-lg bg-blue-600 hover:bg-primary-800 hover:bg-blue-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                                    Start
                                </a>
                            </div>
                        </div>
                    </section>                    
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <NavBar />
                <div>
                    <section class="bg-white dark:bg-gray-900">
                        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
                            <a href="https://github.com/yeghor/Habit-Tracker-React-fastAPI" class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" role="alert">
                            <span class="text-sm font-medium">GitHub Repository page</span> 
                                <svg class="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            </a>
                            <h1 class="mb-4 text-4xl font-bold tracking-tight leading-none text-gray-800 md:text-5xl lg:text-6xl dark:text-white">To acces all the Features. Please, <span className="font-black text-zinc-900">Sigh Up</span></h1>
                            <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">We provide a convenient and safe interface for tracking habits and your own progress.</p>
                            <div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                                <a href="/register" class="inline-flex justify-center items-center py-3 px-5 text-base font-semibold text-center text-white rounded-lg bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                                    Register
                                </a>
                                <a href="/login" class="inline-flex justify-center items-center py-3 px-5 text-base font-semibold text-center text-white rounded-lg bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                                    Login
                                </a>
                            </div>

                        </div>
                    </section>                    
                </div>
            </div>
        );
    };
};


export default MainPage;