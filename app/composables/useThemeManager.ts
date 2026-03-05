import {ref} from "vue";
import { ThemeManager, ThemeMode } from "../lib/core/engine/theme";


export function useThemeManager() {
    const themeType = ref<"dark" | "light">("light");
    if (import.meta.client) {
        const savedThemeMode = localStorage.getItem("ThemeMode") as ThemeMode | null;

        if (savedThemeMode) {
            ThemeManager.setThemeMode(savedThemeMode);
        }
    }
    const setThemeMode = (newThemeMode: ThemeMode) => {
        ThemeManager.setThemeMode(newThemeMode);
        if (newThemeMode !== ThemeMode.AUTO) {
            localStorage.setItem("ThemeMode", newThemeMode);
        }
        themeType.value = ThemeManager.getThemeType();
    };
    const getThemeMode = () => {
        return ThemeManager.getMode();
    };


    return {setThemeMode, getThemeMode,themeType};
}