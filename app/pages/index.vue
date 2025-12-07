<script setup lang="ts">

</script>

<template>


    <DividerContainer class="divider" style="height: 100vh; width: 100vw; overflow: hidden;">
        <template v-slot:left>
            <VisualizerCanvas/>
        </template>
        <template v-slot:right>
            <IDEContainer class="ide-container"/>
        </template>
    </DividerContainer>
</template>

<style scoped>
.visualizer-container {
}
</style>