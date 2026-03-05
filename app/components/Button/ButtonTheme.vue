<script lang="ts" setup>
import { ThemeMode } from "../../lib/core/engine/theme";

const themeManager = useThemeManager();
function toggleTheme() {
    const themeMode = themeManager.getThemeMode();
    if (themeMode === 'light') {
        themeManager.setThemeMode(ThemeMode.DARK);
    }
    else{
        themeManager.setThemeMode(ThemeMode.LIGHT);
    }
}
</script>

<template>
    <button @click="toggleTheme()">
        <Icon v-if="themeManager.themeType.value === 'light'" class="icon" name="ic:round-dark-mode"/>
        <Icon v-else class="icon" name="iconamoon:mode-light"/>
    </button>
</template>

<style scoped>
button {
    border-radius: var(--border-radius-circle);
    font-size: 2em;
    min-height: 30px;
    min-width: 30px;
    padding: var(--padding-sm);
    position: fixed;
    right: var(--spacing-lg);
    top: var(--spacing-lg);
    width: fit-content;
    z-index: 99;
    //background-color: var(--color-overlay);
    //color: var(--text-on-background-color);
}

.icon {
    display: block;
}
</style>