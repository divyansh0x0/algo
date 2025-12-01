<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import {useVisualizerClient} from "~/composables/useVisualizer.client";
const algorithm = 'DFS Graph Traversal'
let updateCanvasSize : () => void;

onMounted(async () => {
    const visualizer_data = useVisualizerClient();
    if(!import.meta.client) return;
    const {Scene, Visualizer, Graph} = await import("@/lib/engine");
    const canvas = document.getElementById('visualizer-canvas')! as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('visualizer-canvas-container')! as HTMLDivElement;
    if(!ctx) return;

    if(!visualizer_data.value.scene){
        visualizer_data.value.scene = new Scene(ctx);
    }
    updateCanvasSize= ()=> {
        if (!ctx || !container) return

        const ratio = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()

        const prevTransform = ctx.getTransform()
        ctx.canvas.width = Math.round(rect.width * ratio)
        ctx.canvas.height = Math.round(rect.height * ratio)
        ctx.setTransform(prevTransform)
        visualizer_data.value.scene.render();
    }
    await nextTick()
    if (!canvas) return

    if (ctx) {
        updateCanvasSize()
    }
    const visualizer = new Visualizer(visualizer_data.value.scene, algorithm);
    visualizer.load(Graph.clustered_graph);
    visualizer.start();
    visualizer_data.value.scene.start();
    window.addEventListener('resize', updateCanvasSize)

})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateCanvasSize)
})
</script>

<template>
    <div id="visualizer-canvas-container">
        <canvas
            ref="canvasRef"
            id="visualizer-canvas"
            v-bind="$attrs"
            width="100"
            height="100"
        ></canvas>
    </div>
</template>

<style scoped>
#visualizer-canvas-container {
    height: 100%;
}
</style>
