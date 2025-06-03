import ThemeToggler from "../components/themeToggler";

const ThemeWrapper = ({ children }) => {
    return(
        <div>
            {children}
            <ThemeToggler />
        </div>
    );
};

export default ThemeWrapper;