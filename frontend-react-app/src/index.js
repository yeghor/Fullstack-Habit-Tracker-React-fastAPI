import React from 'react';
import ReactDOM from 'react-dom/client';
import MainPage from './components/mainPage.jsx'
import Login from './components/login.jsx';
import { BrowserRouter, Routes, Route } from 'react-router' 
import { useState } from 'react';
import { TokenContext } from './tokenContext.jsx';
const root = ReactDOM.createRoot(document.getElementById('root'));
import { Habits } from './components/habits.jsx';


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
                </Routes>
            </TokenContext.Provider>
        </BrowserRouter>
    
    );
};
root.render(<Main/>);