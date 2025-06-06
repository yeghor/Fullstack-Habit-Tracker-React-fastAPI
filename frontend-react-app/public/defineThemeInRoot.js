const allCookies = document.cookie.split(";");
let darkThemeBool = null;

for(let i = 0; i < allCookies.length; i++) {
    let str = allCookies[i];
    str = str.trim();
    if(str.includes("darkTheme")) {
        if(str.includes("true")) { darkThemeBool = true; break};
        darkThemeBool = false;
    };
};

if(darkThemeBool) {
    document.documentElement.classList.toggle("dark");
    document.documentElement.style.backgroundColor = "#111827";
};