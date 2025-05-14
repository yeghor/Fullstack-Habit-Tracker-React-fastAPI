export const handleResponseError = async (response, responseJSON, navigate) => {
    if(!response.ok) {
        if(response.status === 401) {
            navigate("/register");
        };
        try {
            navigate("/internal-server-error", { state: {errorMessage: responseJSON.detail} });
        } catch (err) {
            console.error("Failed to parse JSON response ", err)
            navigate("/server-internal-error", { state: {errorMessage: "Uknown Error Occured"} });
        };
    };
};
