<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { Engine, World } from "../../../lib/core/engine";

const props = defineProps({
    onInitialized: {
        type: Function as PropType<(world: World, ctx: CanvasRenderingContext2D) => void>,
        required: true
    }
});

const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
let observer: ResizeObserver | null = null;
const engine = new Engine();
const scene = new World();
engine.attachScene(scene);


onMounted(async () => {
    if (!import.meta.client) return;
    if (!canvas.value || !container.value) return;
    const ctx = canvas.value.getContext("2d");
    if (!ctx) return;

    await nextTick();
    engine.start();
    props.onInitialized?.call(window, scene, ctx);

    const updateCanvasSize = () => {
        engine.stop();
        if (!canvas.value || !ctx || !container.value) return;

        const ratio = window.devicePixelRatio || 1;
        const rect = container.value.getBoundingClientRect();

        const prevTransform = ctx.getTransform();
        ctx.canvas.width = Math.round(rect.width * ratio);
        ctx.canvas.height = Math.round(rect.height * ratio);
        ctx.setTransform(prevTransform);
        engine.start();
    };
    updateCanvasSize();

    if (observer !== null) return;
    observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container.value);
});

onBeforeUnmount(() => {
    if (!container.value) return;
    observer?.unobserve(container.value);
    engine?.stop();
});
</script>

<template>
    <div class="visualizer-panel" ref="container">
        <!-- Render grid lines or styling for pixel aesthetic if needed -->
        <canvas ref="canvas" class="visualizer-canvas" v-bind="$attrs" />

        <div class="visualizer-toolbar">
            <!-- Space for overlay toolbar tools -->
        </div>
    </div>
</template>

<style scoped>
.visualizer-panel {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--canvas-bg-default-color);
    box-shadow: var(--shadow-pixel-inset);
}

.visualizer-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.visualizer-toolbar {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    display: flex;
    gap: var(--spacing-sm);
    pointer-events: none;
}

/* Allow buttons inside toolbar to be clickable */
.visualizer-toolbar>* {
    pointer-events: auto;
}
</style>
