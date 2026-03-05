import { DefaultDarkTheme, DefaultLightTheme, type ThemeStyle } from "./ThemeStyle";
export enum ThemeMode {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto"
}
export const ThemeManager = (function () {

    let lightTheme: ThemeStyle = DefaultLightTheme;
    let darkTheme: ThemeStyle = DefaultDarkTheme;

    let currentTheme: ThemeStyle;
    let themeMode: ThemeMode = ThemeMode.AUTO;

    function setWebsiteTheme(themeName: "dark" | "light"): void {
        if(document){
            document.documentElement.dataset.theme = themeName;
        }
    }
    function applySystemTheme() {
        if (!window.matchMedia) return;

        const media = window.matchMedia("(prefers-color-scheme: dark)");


        const update = () => {
            currentTheme = media.matches ? darkTheme : lightTheme;
            setWebsiteTheme(media.matches ? "dark" : "light");
        };

        update();
        media.addEventListener("change", update);
    }

    function updateTheme() {
        switch (themeMode) {
            case ThemeMode.LIGHT:
                setWebsiteTheme("light");
                currentTheme = lightTheme;
                break;
            case ThemeMode.DARK:
                setWebsiteTheme("dark");
                currentTheme = darkTheme;
                break;
            case ThemeMode.AUTO:
                applySystemTheme();
                break;
        }

    }

    return {

        setThemes(light: ThemeStyle, dark: ThemeStyle) {
            lightTheme = light;
            darkTheme = dark;
            updateTheme();
        },

        setThemeMode(type: ThemeMode) {
            themeMode = type;
            updateTheme();
        },

        get(): ThemeStyle {
            return currentTheme;
        },

        color<K extends keyof ThemeStyle>(key: K): ThemeStyle[K] {
            return currentTheme[key];
        },

        getMode(): ThemeMode {
            return themeMode;
        },
        getThemeType(): "light" | "dark" {
            if(document?.documentElement?.dataset?.theme){
                return document.documentElement.dataset.theme as "dark" | "light";
            }
            return "light";
        }
    };

})();