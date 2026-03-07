<script lang="ts" setup>
// Simple layout divider 
</script>

<template>
    <div class="pixel-hr" v-bind="$attrs" />
</template>

<style scoped>
.pixel-hr {
    width: 100%;
    height: var(--border-width-sm);
    background-color: var(--color-border);
    margin: var(--spacing-md) 0;
}
</style>
