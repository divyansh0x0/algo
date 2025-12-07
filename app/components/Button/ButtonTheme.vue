<script lang="ts" setup>
const {theme, toggleTheme} = useThemeManager();

</script>

<template>
    <button @click="toggleTheme()">
        <Icon v-if="theme == 'light'" class="icon" name="ic:round-dark-mode"/>
        <Icon v-else class="icon" name="iconamoon:mode-light"/>
    </button>
</template>

<style scoped>
button {
    font-size: 2em;
    min-height: 30px;
    width: fit-content;
    min-width: 30px;
    z-index: 99;
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    padding: var(--padding-sm);
    border-radius: var(--border-radius-circle);
    background-color: var(--color-overlay);
    color: var(--text-on-background-color);
}

.icon {
    display: block;
}
</style>