<script lang="ts" setup>
import { ThemeMode } from "./lib/core/engine/theme";

const themeManager = useThemeManager();
themeManager.setThemeMode(ThemeMode.AUTO);
</script>
<template>
    <ButtonTheme/>
    <main :class="$colorMode.value" class="h-screen w-screen overflow-hidden">
        <NuxtPage/>
    </main>
</template>
<style scoped></style>
