import React from "react";
import { useState, useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetUserProfile } from "../api_fetching/urlParserMainFucntionality";
import NavBar from "./navBar";
import { useNavigate } from "react-router";
import { handleResponseError } from "../utils/handleResponse";

const UserProfile = () => {
    const [ token, setToken ] = useContext(TokenContext);
    const [ profile, setProfile ] = useState({});
    const [ refresh, setRefresh ] = useState(false);
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            try {
                const response = await fetchGetUserProfile(token);
                const reponseJSON = await response.json();

                await handleResponseError(response, reponseJSON, navigate);

                setProfile(reponseJSON);
            } finally {
                setLoading(false)
            }
        };
        fetchProfile()
    }, [refresh]);

    if(token) {
        return(
            <div>
                <NavBar />
                {!loading ?
                    <div>
                        <div>
                            <h2>{profile.username}</h2>
                            <h3>{profile.email}</h3>
                            <h3>{profile.joined_at}</h3>
                            <p>ID: {profile.user_id}</p>
                        </div>
                        <button onClick={() => setRefresh(!refresh)}>Refresh Info</button>
                    </div>
                : <h2>Loading...</h2>}
            </div>
        );
    } else {
        navigate("/login")
    }

};

export default UserProfile;