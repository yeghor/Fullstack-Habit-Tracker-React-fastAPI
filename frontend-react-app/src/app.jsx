import React from "react";
import {fetchTest, fetchLogin} from "./url_parser";
import { useState, useEffect } from "react";

function App() {
    const [resetButton, setResetButton] = useState(false);
    const [token, setToken] = useState(null);
    const [tokenExpiresAt, setExpiresAt] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const data = await fetchLogin("reactshit", "reactpassword", "react@email.com")
                console.log(data)
                setToken(data.token)
                setExpiresAt(data.expires_at)
            } catch (err) {
                console.error("Error while fetching login")
                console.error(err.status)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

    }, [resetButton]);


    const clickHandler = () => {
        setResetButton(!resetButton)
    }

    return (
        <div>
            <h1>Token: {loading ? "Loading..." : token}</h1>
            <h2>Epires at UNIX: {loading ? "Loading..." : tokenExpiresAt}</h2>
            <button onClick={clickHandler}>TestLogin</button>
        </div>
    );
};

export default App;