<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted } from "vue";
import { Engine, World } from "../lib/core/engine";
const canvas = ref<HTMLCanvasElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
let observer: ResizeObserver | null = null;
const engine = new Engine();
const scene = new World();
engine.attachScene(scene);


const props = defineProps({
    onInitialized:{
       type: Function as PropType<(world:World,ctx:CanvasRenderingContext2D) => void>,
       required: true
    }
});
onMounted(async () => {
    if (!import.meta.client) return;
    if (!canvas.value || !container.value) return;
    const ctx = canvas.value.getContext("2d");
    if (!ctx) return;

    await nextTick();
    engine.start();
    props.onInitialized?.call(window,scene,ctx);
    const updateCanvasSize = () => {
        if (!canvas.value || !ctx || !container.value) {
            return;
        }
        const ratio = window.devicePixelRatio || 1;
        const rect = container.value.getBoundingClientRect();

        const prevTransform = ctx.getTransform();
        ctx.canvas.width = Math.round(rect.width * ratio);
        ctx.canvas.height = Math.round(rect.height * ratio);
        ctx.setTransform(prevTransform);
    };
    updateCanvasSize();

    if(observer !== null) return;
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
    <div ref="container" style="position: relative;height: 100%; width: 100%">
        <canvas
            ref="canvas"
            v-bind="$attrs"
        />
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
