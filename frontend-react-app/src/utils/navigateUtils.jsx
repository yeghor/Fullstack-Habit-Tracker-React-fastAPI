export const navigateToServerInternalError = (navigate, errorState) => {
    navigate("../internal-server-error", { state: { "errorMessage": errorState || null } });
};