<script lang="ts" setup>
import PixelButton from '../ui/PixelButton.vue';
import { ThemeMode } from "../../lib/core/engine/theme";

const themeManager = useThemeManager();

function toggleTheme() {
    const themeMode = themeManager.getThemeMode();
    if (themeMode === 'light') {
        themeManager.setThemeMode(ThemeMode.DARK);
    } else {
        themeManager.setThemeMode(ThemeMode.LIGHT);
    }
}
</script>

<template>
    <header class="app-header">
        <div class="header-brand">
            <div class="pixel-logo"></div>
            <h1 class="header-title">ALGO <span class="header-subtitle">YASL Studio</span></h1>
        </div>

        <div class="header-controls">
            <PixelButton variant="ghost" @click="toggleTheme()"
                :icon="themeManager.themeType.value === 'light' ? 'ic:round-dark-mode' : 'iconamoon:mode-light'"
                aria-label="Toggle Theme" />
            <slot name="controls" />
        </div>
    </header>
</template>

<style scoped>
.app-header {
    height: 48px;
    background-color: var(--color-surface-container-high);
    border-bottom: var(--border-width-md) solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--padding-md);
    flex-shrink: 0;
    z-index: 100;
}

.header-brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.pixel-logo {
    width: 20px;
    height: 20px;
    background-color: var(--color-primary);
    box-shadow: 4px 4px 0 0 var(--color-secondary);
    margin-right: var(--spacing-sm);
}

.header-title {
    font-family: var(--font-family);
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: var(--color-on-surface);
    margin: 0;
    text-transform: uppercase;
}

.header-subtitle {
    color: var(--color-primary);
    font-weight: normal;
    font-size: 0.8em;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}
</style>
