<script setup lang="ts">
const isIDELoaded = ref(false);
onMounted(() => {
    isIDELoaded.value = true;
})
</script>

<template>


    <DividerContainer class="divider" style="height: 100vh; width: 100vw; overflow: hidden;">
        <template v-slot:left>
            <VisualizerCanvas/>
        </template>
        <template v-slot:right>
            <OverlayLoader :loading="!isIDELoaded">
                <IDEContainer class="ide-container"/>
            </OverlayLoader>
        </template>
    </DividerContainer>
</template>

<style scoped>
.visualizer-container {
}
</style>