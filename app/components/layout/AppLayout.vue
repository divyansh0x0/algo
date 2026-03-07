<script lang="ts" setup>
// Main Application AppLayout Wrapper 
</script>

<template>
    <div class="app-layout">
        <slot name="header" />
        <main class="app-main">
            <slot />
        </main>
        <slot name="footer" />
    </div>
</template>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: var(--color-background);
    color: var(--color-on-surface);
}

.app-main {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
}
</style>
