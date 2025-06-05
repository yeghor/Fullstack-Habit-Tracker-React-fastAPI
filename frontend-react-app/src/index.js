import React from 'react';
import ReactDOM from 'react-dom/client';
import MainPage from './components/mainPage.jsx'
import Login from './components/authrorization/login.jsx'
import Register from './components/authrorization/register.jsx';
import { BrowserRouter, Routes, Route } from 'react-router' 
const root = ReactDOM.createRoot(document.getElementById('root'));
import { Habits } from './components/habitsPage.jsx';
import UserProfile from './components/userProfile.jsx';
import InternalServerError from './components/internalServerError.jsx';
import HabitCompletions from './components/habitCompletions.jsx';
import ThemeWrapper from './utils/themeWrapper.jsx';
import NotFound from './components/notFound.jsx';

function Main() {
    return( 
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<ThemeWrapper><MainPage /></ThemeWrapper>} />
                <Route path='/habits' element={<ThemeWrapper><Habits /></ThemeWrapper>} />
                <Route path='/login' element={<ThemeWrapper><Login /></ThemeWrapper>} />
                <Route path='/register' element={<ThemeWrapper><Register /></ThemeWrapper>} />
                <Route path='/internal-server-error' element={<ThemeWrapper><InternalServerError /></ThemeWrapper>} />
                <Route path='/user-profile' element={<ThemeWrapper><UserProfile /></ThemeWrapper>} />
                <Route path='/to-many-requests' element={<ThemeWrapper><div>Too many requests. PLEASE STOP!</div></ThemeWrapper>} />
                <Route path='/habit_completions/:id' element={<ThemeWrapper><HabitCompletions /></ThemeWrapper>} />

                <Route path='*' element={<ThemeWrapper><NotFound /></ThemeWrapper>}/>
            </Routes> 
        </BrowserRouter>
    
    );
};
root.render(<Main/>);