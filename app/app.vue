<script lang="ts" setup>
import { ThemeMode } from "./lib/core/engine/theme";
import AppLayout from './components/layout/AppLayout.vue';
import AppHeader from './components/layout/AppHeader.vue';

const themeManager = useThemeManager();
themeManager.setThemeMode(ThemeMode.AUTO);
</script>

<template>
    <AppLayout :class="$colorMode.value">
        <template #header>
            <AppHeader />
        </template>

        <NuxtPage />
    </AppLayout>
</template>

<style scoped></style>
