<script setup lang="ts">
import {onMounted} from "vue";

onMounted(async () => {
    const {ThemeManager, ThemeType} = await import("@/lib/engine");
    ThemeManager.setThemeType(ThemeType.AUTO);
});
</script>
<template>
    <main class="page-content">
            <NuxtPage />
    </main>
</template>
<style scoped>
.page-content {
    height: 100vh;
}
</style>
