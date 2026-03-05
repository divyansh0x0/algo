import { Color } from "../utils";



export type ThemeStyle = {
    primary: Color;
    secondary: Color;
    background: Color;
    surface: Color;
    textPrimary: Color;
    textSecondary: Color;
    border: Color;
    grid:Color;
};

export const DefaultLightTheme: ThemeStyle = {
    primary: new Color("#4f46e5"),
    secondary: new Color("#10b981"),
    background: new Color("#ffffff"),
    surface: new Color("#f5f5f5"),
    textPrimary: new Color("#000000"),
    textSecondary: new Color("#555555"),
    border: new Color("#dddddd"),
    grid: new Color("#e9e9e9")
};

export const DefaultDarkTheme: ThemeStyle = {
    primary: new Color("#6366f1"),
    secondary: new Color("#34d399"),
    background: new Color("#0f172a"),
    surface: new Color("#1e293b"),
    textPrimary: new Color("#ffffff"),
    textSecondary: new Color("#cbd5f5"),
    border: new Color("#334155"),
    grid: new Color("#181a23")
};