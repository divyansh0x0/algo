<script lang="ts" setup>
const isIDELoaded = ref(false);
onMounted(() => {
    isIDELoaded.value = true;
});
</script>

<template>


    <DividerContainer class="divider" style="height: 100vh; width: 100vw; overflow: hidden;">
        <template #left>
            <VisualizerCanvas/>
        </template>
        <template #right>
            <OverlayLoader :loading="!isIDELoaded">
                <EditorContainer/>
            </OverlayLoader>
        </template>
    </DividerContainer>
</template>

<style scoped>
.visualizer-container {
}
</style>