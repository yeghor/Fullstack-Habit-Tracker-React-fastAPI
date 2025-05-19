export const handleResponseError = async (response, responseJSON, navigate, setToken, navigateTo,) => {
    if(!response.ok) {
        if(response.status === 401) {
            setToken()
            navigate("/register");
            return
        };
        try {
            navigate("/internal-server-error", { state: {errorMessage: responseJSON.detail} });
            return
        } catch (err) {
            console.error("Failed to parse JSON response ", err)
            navigate("/internal-server-error", { state: {errorMessage: "Uknown Error Occured"} });
            return
        };
    } else {
        if(navigateTo) {
            navigate(navigateTo)
        };
        return
    };
};
