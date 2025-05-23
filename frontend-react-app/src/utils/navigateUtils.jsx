export const navigateToServerInternalError = (navigate) => {
    navigate("../internal-server-error", { state: { "errorMessage": null } });
};