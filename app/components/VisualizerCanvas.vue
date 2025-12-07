<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted} from 'vue'
import {useVisualizerClient} from "~/composables/useVisualizer.client";

const algorithm = 'DFS Graph Traversal'
let updateCanvasSize : () => void;
const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
let observer: ResizeObserver | null = null;
onMounted(async () => {
    const visualizer_data = useVisualizerClient();
    if (!canvas.value || !container.value) {
        return
    }
    if(!import.meta.client) return;
    const {Scene, Visualizer, Graph} = await import("@/lib/engine");
    const ctx = canvas.value.getContext('2d');
    if(!ctx) return;

    if(!visualizer_data.value.scene){
        visualizer_data.value.scene = new Scene(ctx);
    }
    updateCanvasSize= ()=> {
        if (!canvas.value || !ctx || !container.value) {
            return
        }
        const ratio = window.devicePixelRatio || 1
        const rect = container.value.getBoundingClientRect()

        const prevTransform = ctx.getTransform()
        ctx.canvas.width = Math.round(rect.width * ratio)
        ctx.canvas.height = Math.round(rect.height * ratio)
        ctx.setTransform(prevTransform)
        visualizer_data.value.scene.render();
    }
    await nextTick()
    if (!canvas.value) return

    if (ctx) {
        updateCanvasSize()
    }
    const visualizer = new Visualizer(visualizer_data.value.scene, algorithm);
    visualizer.load(Graph.clustered_graph);
    visualizer.start();
    visualizer_data.value.scene.start();
    // container.value.addEventListener('resize', updateCanvasSize)
    observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container.value);
})

onBeforeUnmount(() => {
    if (!container.value) return;
    observer?.unobserve(container.value);
})
</script>

<template>
    <div ref="container" style="position: relative;height: 100%; width: 100%">
        <canvas
            ref="canvas"
            v-bind="$attrs"
        ></canvas>
        <OverlayToolbar class="overlay-toolbar"/>

    </div>
</template>

<style scoped>
.overlay-toolbar {
    width: 100%;
    height: fit-content;
    position: absolute;
    padding: var(--padding-sm);
}
</style>
