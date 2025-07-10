import { Color } from "@/engine/color";

export enum ThemeType {
    LIGHT,
    DARK,
    AUTO
}

export enum ColorStates {
    DEFAULT = "default",
    HIGHLIGHTED = "highlighted",
    SELECTED = "selected",
    HOVER = "hover",
    ON_BACKGROUND = "on-background",
    ON_PRIMARY = "on-primary",
    ON_SECONDARY = "on-secondary",
    BORDER = "border",
}

export const ThemeManager = (function () {
    const theme_attrib = "theme";
    let match_system_theme = false;
    let is_theme_listener_active = false;
    let styles = getComputedStyle(document.documentElement);

    // setInterval(()=>themeUpdated(), 50)

    function enableSystemThemeMatching() {
        if (window.matchMedia) {
            const match_media_color_scheme = window.matchMedia("(prefers-color-scheme: dark)");
            match_system_theme = true;
            if (match_media_color_scheme.matches) {
                document.documentElement.setAttribute(theme_attrib, "dark");
                //console.log("Dark theme enabled");
            } else
                document.documentElement.setAttribute(theme_attrib, "light");

            //attach listener for theme changes
            if (is_theme_listener_active)
                return;
            match_media_color_scheme.addEventListener(
                "change", e => {
                    is_theme_listener_active = true;
                    if (!match_system_theme)
                        return;

                    themeUpdated();
                    if (e.matches) {
                        document.documentElement.setAttribute(theme_attrib, "dark");
                        //console.log("Dark theme enabled");
                        return;
                    }
                    document.documentElement.setAttribute(theme_attrib, "light");
                }
            );

        } else {
            //console.log("No support for matchMedia. Defaulting to light theme");
            document.documentElement.setAttribute(theme_attrib, "light");
        }
    }

    function themeUpdated() {
        styles = getComputedStyle(document.documentElement);
        //console.log("theme updated", styles);

    }

    function disableSystemThemeMatching() {
        match_system_theme = false;
    }

    return {
        setThemeType: (themeType: ThemeType) => {
            styles = getComputedStyle(document.documentElement);
            disableSystemThemeMatching();
            switch (themeType) {
                case ThemeType.LIGHT:
                    document.documentElement.setAttribute(theme_attrib, "light");
                    break;
                case ThemeType.DARK:
                    document.documentElement.setAttribute(theme_attrib, "dark");
                    break;
                case ThemeType.AUTO:
                    enableSystemThemeMatching();
                    break;

            }
            themeUpdated();

        },

        /**
         * Return the css bg color property for item_name
         */
        getBgColor(item_name: string, suffix: ColorStates = ColorStates.DEFAULT): Color {
            const property_name = `--${ item_name }-bg-${ suffix }-color`;
            const val = styles.getPropertyValue(property_name);
            if (val === "")
                console.error(property_name, " is not defined.");
            return new Color(val);
        },
        /**
         * Return the css fg color property for item_name
         * @param item_name
         * @param {"default"|"highlighted"|"selected"|"hover"} suffix
         * @returns {string}
         */
        getFgColor(item_name: string, suffix: ColorStates = ColorStates.DEFAULT): Color {
            const property_name = `--${ item_name }-fg-${ suffix }-color`;
            const val = styles.getPropertyValue(property_name);
            if (val === "")
                console.error(property_name, " is not defined.");
            return new Color(val);
        },
        /**
         * Return the css text color
         * @param {"on-primary"|"on-secondary"|"on-background"} suffix
         * @returns {string}
         */
        getTextColor(suffix: ColorStates = ColorStates.ON_BACKGROUND): Color {
            const property_name = `--text-${ suffix }-color`;
            const val = styles.getPropertyValue(property_name);
            if (val === "")
                console.error(property_name, " is not defined.");
            return new Color(val);

        },
        /**
         * Return the css color for the item
         * @param item_name
         * @returns {string}
         */
        getColor(item_name: string): Color {
            const property_name = `--${ item_name }-color`;
            const val = styles.getPropertyValue(property_name);
            if (val === "")
                console.error(property_name, "is not defined.");
            return new Color(val);
        }
    };
})();

