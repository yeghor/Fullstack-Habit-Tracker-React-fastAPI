
export const verifyUsernameLength = (username) => {
    return username.length >= 3 && username.length <= 50;
};
export const verifyEmail = (email) => {
    return email.includes("@", ".");
};

export const verifyPasswordLength = (password) => {
    return password.length >= 8 && password.length <= 30;
};