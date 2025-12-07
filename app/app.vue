<script setup lang="ts">
import {useThemeManager} from "~/composables/useThemeManager";

useThemeManager();
</script>
<template>
    <ButtonTheme/>
    <main :class="$colorMode.value" class="h-screen w-screen overflow-hidden">
            <NuxtPage />
    </main>
</template>
<style scoped>
</style>
