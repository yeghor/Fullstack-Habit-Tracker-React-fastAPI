import React from "react";
import { useState, useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetUserProfile } from "../api_fetching/urlParserMainFucntionality";
import NavBar from "./navBar";
import { useNavigate } from "react-router";
import { handleResponseError } from "../utils/handleResponse";
import "../index.css"
import { changeUsernameURL } from "../api_fetching/urls";
import { changePasswordURL } from "../api_fetching/urls";
import { fetchChangePassword } from "../api_fetching/urlParserAuthorization";

const UserProfile = () => {
    const [ token, setToken ] = useContext(TokenContext);
    const [ profile, setProfile ] = useState({});
    const [ refresh, setRefresh ] = useState(false);
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await fetchGetUserProfile(token);
                const reponseJSON = await response.json();

                handleResponseError(response, reponseJSON, navigate);

                setProfile(reponseJSON);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [refresh]);

    const handleChangePassword = () => {
    }

    const handleChangeUsername = () => {
    }

    if(token) {
        return(
            <div>
                <NavBar />
                <div className="min-h-screen bg-white flex flex-col items-center">
                    <div className="w-full max-w-md mt-20 bg-white shadow-2xl rounded-3xl p-8 flex flex-col items-center border border-gray-200">
                        <div className="flex flex-col items-center mb-6">
                            <img
                                className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-lg mb-4 object-cover"
                                src={`https://ui-avatars.com/api/?name=${profile.username || 'User'}&background=4f46e5&color=fff&size=128`}
                                alt="User avatar"
                            />
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.username}</h2>
                            <p className="text-gray-500 text-sm">{profile.email}</p>
                        </div>
                        <div className="flex flex-col gap-4 w-full mt-4">
                            <button
                                onClick={handleChangePassword}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200">
                                Change Password
                            </button>
                            <button
                                onClick={handleChangeUsername}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200">
                                Change Username
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        navigate("/register");
    }

};

export default UserProfile;