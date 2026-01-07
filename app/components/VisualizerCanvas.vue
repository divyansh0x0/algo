<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted } from "vue";

const algorithm = "DFS Graph Traversal";
let updateCanvasSize: () => void;
const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
let observer: ResizeObserver | null = null;
let engine: any;
onMounted(async () => {
    if (!canvas.value || !container.value) {
        return;
    }
    if (!import.meta.client) return;
    const {World, Engine, Visualizer, Graph} = await import("~/lib/core/engine");
    const ctx = canvas.value.getContext("2d");
    if (!ctx) return;
    updateCanvasSize = () => {
        if (!canvas.value || !ctx || !container.value) {
            return;
        }
        const ratio = window.devicePixelRatio || 1;
        const rect = container.value.getBoundingClientRect();

        const prevTransform = ctx.getTransform();
        ctx.canvas.width = Math.round(rect.width * ratio);
        ctx.canvas.height = Math.round(rect.height * ratio);
        ctx.setTransform(prevTransform);
        // const entity = scene.createEntity();
        // entity.add(new ECPosition(ctx.canvas.width/2,ctx.canvas.height/2));
        // entity.add(new ECVelocity(0,0));
        // entity.add(ECAxisAlignedBoundingBox.fromRectangle(100,100));
        // entity.add(new ECRectangle(100,100, ECDrawableStyle.Fill));
        // entity.add(new ECBackgroundColor(new Color(255,255,255,0.05)));
        // entity.add(new ECDraggable());
        // scene.addEntity(entity);

    };
    const scene = new World();
    engine = new Engine();
    engine.attachScene(scene);
    const visualizer = new Visualizer(scene, ctx);
    visualizer.addArray([ 1, 2, 3, 4 ]);


    await nextTick();
    if (!canvas.value) return;

    if (ctx) {
        updateCanvasSize();
    }
    // container.value.addEventListener('resize', updateCanvasSize)
    observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container.value);
    engine.start();
});

onBeforeUnmount(() => {
    if (!container.value) return;
    observer?.unobserve(container.value);
    engine?.stop();
});
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
