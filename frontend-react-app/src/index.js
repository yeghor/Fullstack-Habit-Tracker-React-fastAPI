import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx'
import { BrowserRouter, Routes, Route } from 'react-router' 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} />
        </Routes>
    </BrowserRouter>
)