type Theme = "light" | "dark";
const {ThemeManager, ThemeType} = await import("@/lib/engine");

function updateTheme(theme: Theme) {
    ThemeManager.setThemeType(theme == "light" ? ThemeType.LIGHT : ThemeType.DARK);
    // document.documentElement.setAttribute("theme",theme);
}

export function useThemeManager() {
    const theme = ref<Theme>('light');
    if (import.meta.client) {
        const saved = localStorage.getItem('theme') as Theme | null
        if (saved === 'light' || saved === 'dark') {
            theme.value = saved
        } else {
            if (window.matchMedia) {
                const match_media_color_scheme = window.matchMedia('(prefers-color-scheme: dark)')
                const isDark = match_media_color_scheme.matches;
                updateTheme(isDark ? "dark" : "light");
                match_media_color_scheme.addEventListener("change", () => {
                    updateTheme(match_media_color_scheme.matches ? "dark" : "light");
                })
            }
        }
        updateTheme(theme.value);
    }
    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme;
        if (import.meta.client) {
            updateTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        }
    }
    const toggleTheme = () => {
        theme.value = theme.value == "light" ? "dark" : "light";
        if (import.meta.client) {
            updateTheme(theme.value);
            localStorage.setItem('theme', theme.value);
        }
    }
    return {theme, toggleTheme, setTheme};
}