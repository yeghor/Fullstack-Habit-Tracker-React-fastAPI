import React from 'react';
import ReactDOM from 'react-dom/client';
import MainPage from './components/mainPage.jsx'
import Login from './components/authrorization/login.jsx'
import Register from './components/authrorization/register.jsx';
import { BrowserRouter, Routes, Route } from 'react-router' 
import { useState } from 'react';
import { TokenContext } from './tokenContext.jsx';
const root = ReactDOM.createRoot(document.getElementById('root'));
import { Habits } from './components/habits.jsx';
import LoginTimeOut from './components/loginTimeout.jsx';
import UserProfile from './components/userProfile.jsx';
import InternalServerError from './components/internalServerError.jsx';
import HabitCompletions from './components/habitCompletions.jsx';

function Main() {
    const [token , setToken] = useState(() => { return localStorage.getItem("token")});
    const updateToken = (newToken) => {
        if(newToken) {
            setToken(newToken);
            localStorage.setItem("token", newToken);
        } else {
            setToken(undefined);
            localStorage.removeItem("token");
        };
    };

    return( 
        <BrowserRouter>
            <TokenContext.Provider value={[token, updateToken]}>
                <Routes>
                    <Route path='/' element={<MainPage />} />
                    <Route path='/habits' element={<Habits />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/login-timeout' element={<LoginTimeOut />} />
                    <Route path='/internal-server-error' element={<InternalServerError />} />
                    <Route path='/user-profile' element={<UserProfile />} />
                    <Route path='/to-many-requests' element={<div>Too many requests. PLEASE STOP!</div>} />
                    <Route path='/habit_completions' element={<HabitCompletions />} />
                </Routes> 
            </TokenContext.Provider>
        </BrowserRouter>
    
    );
};
root.render(<Main/>);