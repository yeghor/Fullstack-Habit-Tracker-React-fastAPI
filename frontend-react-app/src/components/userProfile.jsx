import React from "react";
import { useState, useContext, useEffect } from "react";
import { TokenContext } from "../tokenContext";
import { fetchGetUserProfile } from "../api_fetching/urlParserMainFucntionality";
import NavBar from "./navBar";
import { useNavigate } from "react-router";
import { handleResponseError } from "../utils/handleResponse";
import "../index.css"
import { fetchChangePassword, fetchChangeUsername, fetchCheckTokenExpiery } from "../api_fetching/urlParserAuthorization";
import { defineCookies } from "../utils/cookieToken";
import { navigateToServerInternalError } from "../utils/navigateUtils";

const UserProfile = () => {
    const [token, setToken] = defineCookies();

    const [ profile, setProfile ] = useState({});
    const [ refresh, setRefresh ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ showChangeUsernameForm, setShowChangeUsernameForm ] = useState(false);
    const [ showChangePasswordForm, setShowChangePasswordForm ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

    const [ userXP, setUserXP ] = useState(null);

    const [ oldPassword, setOldPassword ] = useState(null);
    const [ newPasswordFirst, setNewPasswordFirst ] = useState(null);
    const [ newPasswordSecond, setNewPasswordSecond ] = useState(null);

    const [ newUsername, setNewUsername ] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await fetchGetUserProfile(token);
                const responseJSON = await response.json();

                handleResponseError(response, responseJSON, navigate, setToken);
                setProfile(responseJSON);
            } catch (err) {
                console.error(err);
                navigateToServerInternalError(navigate);
                return 
            } finally {
                setLoading(false);
            };
        };
        fetchProfile();
    }, [refresh]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const fetchPass = async () => {
            if(newPasswordFirst !== newPasswordSecond) {
                setErrorMessage("Password didn't match");
                return;
            };

            try {
                const response = await fetchChangePassword(oldPassword, newPasswordFirst, token);
                const responseJSON = await response.json();
                
                handleResponseError(response, responseJSON, navigate, setToken, setErrorMessage);
                
                if(!response.ok) { // if response !=200 - handling error in handleResponseError and changing errorMessage state
                    return;
                };

                setRefresh(!refresh);
                setShowChangePasswordForm(!showChangePasswordForm);
            } catch (err) {
                console.error(err);
                navigateToServerInternalError(navigate)
                return;
            };            
        };
        fetchPass()
    };

    const handleChangeUsername = (e) => {
        e.preventDefault();
        const fetchUsrnm = async () => {
            if(newUsername === profile.username) {
                setErrorMessage("New username can't be same as old one");
                return;
            };

            try {
                const response = await fetchChangeUsername(newUsername, token);
                const responseJSON = await response.json();

                handleResponseError(response, responseJSON, navigate, setToken);
                setProfile({...profile, "username": newUsername});
                setShowChangeUsernameForm(!showChangeUsernameForm);
            } catch(err) {
                console.error(err);
                navigateToServerInternalError(navigate);
                return;
            };
        };
        fetchUsrnm();
    };

    const getPersentageOfWidthProgressBar = () => {
        return profile.xp / profile.xp_to_next_level
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
                        <div className="text-center font-semibold text-gray-700 mb-3">
                            <p>Level - {profile.level}</p>
                            <p>XP - {profile.user_xp_total}</p>
                            <p>To achieve next level XP remaining - {profile.next_level_xp_remaining}</p>                            
                        </div>
                        <div className="w-full bg-gray-100 rounded-full flex justify-start">
                            <div style={{ width: `${getPersentageOfWidthProgressBar() * 100}%` }} className={`rounded-full bg-blue-500 text-white p-1.5 font-semibold`}></div>
                        </div>
                        <div className="flex flex-col gap-4 w-full mt-4">
                            <button
                                onClick={() => {setShowChangePasswordForm(!showChangePasswordForm); setErrorMessage(null)}}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200">
                                Change Password
                            </button>
                            <button
                                onClick={() => {setShowChangeUsernameForm(!showChangeUsernameForm); setErrorMessage(null)}}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200">
                                Change Username
                            </button>
                        </div>
                    </div>
                </div>
                {showChangePasswordForm ?
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                        <form className="space-y-6" onSubmit={handleChangePassword}>
                            <div className="flex justify-end items-center">
                                <button onClick={() => setShowChangePasswordForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                                    ✕
                                </button>
                            </div>
                            <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Please, fill up form with new secure password
                            </h5>
                            {errorMessage && (
                            <div>
                                <p className="font-semibold text-red-600">{errorMessage}</p>
                            </div>
                            )}
                            <div>
                            <label htmlFor="passwordOld" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Old password
                            </label>
                            <input
                                onChange={(e) => setOldPassword(e.target.value)}
                                type="password"
                                name="passwordOld"
                                id="passwordOne"
                                placeholder="New Password"
                                minLength="8"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            />
                            </div>
                            <div>
                            <label htmlFor="passwordOne" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                New Password
                            </label>
                            <input
                                onChange={(e) => setNewPasswordFirst(e.target.value)}
                                type="password"
                                name="passwordOne"
                                id="passwordOne"
                                placeholder="New Password"
                                minLength="8"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            />
                            </div>
                            <div>
                            <label htmlFor="passwordTwo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Confirm new password
                            </label>
                            <input
                                onChange={(e) => setNewPasswordSecond(e.target.value)}
                                type="password"
                                name="passwordTwo"
                                id="passwordTwo"
                                placeholder="Confirm new password"
                                minLength="8"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            />
                            </div>
                            <button
                            type="submit"
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                            <span className="font-semibold">Change Password</span>
                            </button>
                        </form>
                        </div>
                    </div>
                : null}
            { showChangeUsernameForm ?
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleChangeUsername}>
                        <div className="flex justify-end items-center">
                            <button onClick={() => setShowChangeUsernameForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                                ✕
                            </button>
                        </div>

                        <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Please, fill up form with your new username
                        </h5>
                        {errorMessage && (
                        <div>
                            <p className="font-semibold text-red-600">{errorMessage}</p>
                        </div>
                        )}
                        <div>
                            <label htmlFor="newUsername" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                New Username    
                            </label>
                            <input
                                onChange={(e) => setNewUsername(e.target.value)}
                                type="text"
                                name="newUsername"
                                id="newUsername"
                                placeholder="New Username"
                                minLength="3"
                                required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            />
                        </div>
                        <button
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                        <span className="font-semibold">Change Password</span>
                        </button>
                    </form>
                    </div>
                </div>                
            : null}
            </div>
        );
    } else {
        navigate("/register");
    }

};

export default UserProfile;