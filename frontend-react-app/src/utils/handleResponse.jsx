export const handleResponseError = (response, responseJSON, navigate, setToken, setErrorMessage, navigateToIfSucces) => {
    if(!response.ok) {
        if(response.status === 401) {
            setToken();
            navigate("/register");
            return true;
        } else if(response.status === 422) {
            if(!setErrorMessage) {
                navigate("/internal-server-error", { state: {errorMessage: "The server was unable to process the request because it contains invalid data." } });
                return true;
            };
            setErrorMessage("The server was unable to process the request because it contains invalid data.");
            return true;
        } else if (response.status === 429) {
            // navigate("/internal-server-error", { state: {errorMessage: "Too many requests. Please, make a pause. And try again later" } });
            alert("Too many requests! Make a pause and try again later.")
            return true;
        } else if(response.status === 400) {
            if(!setErrorMessage) { // setting error message only if response statuc code 400 - bad request. To inform user about incorrect data input.
                navigate("/internal-server-error", { state: {errorMessage: "The server was unable to process the request because it contains invalid data." } });
                return true
            };
            setErrorMessage(responseJSON.detail);
            return;
        };

        if(responseJSON.detail) {
            navigate("/internal-server-error", { state: {errorMessage: responseJSON.detail} });
            return true;            
        };
        navigate("/internal-server-error", { state: {errorMessage: "Uknown Error Occured. Please, try again later"}});
        return true;

    } else {
        if(navigateToIfSucces) {
            navigate(navigateToIfSucces);
        };
        return false;
    }; 
};