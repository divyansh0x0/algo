<script lang="ts" setup>
import { Visualizer, type World } from "../lib/core/engine";
import { TracerType, type YASLTracer, type YASLTracerDeclareVariable } from "../lib/core/yasl/tracer/Tracers";

const isIDELoaded = ref(false);
const visualizer = new Visualizer();
const code = `let x = [1,2,3]
print(x)
`
onMounted(() => {
    isIDELoaded.value = true;
    visualizer.addArray([1,2,3]);
});
function onInitialized(world: World, ctx: CanvasRenderingContext2D) {
    visualizer.setScene(world,ctx);
    visualizer.addArray([1,2,3,4,6]);
}

function traceReceiver(trace: YASLTracer) {
    console.log(trace);
}
</script>

<template>


    <DividerContainer class="divider" style="height: 100vh; width: 100vw; overflow: hidden;">
        <template #left>
            <VisualizerCanvas :on-initialized="onInitialized" />
        </template>
        <template #right>
            <OverlayLoader :loading="!isIDELoaded">
                <EditorContainer :trace-receiver="traceReceiver" :code="code"/>
            </OverlayLoader>
        </template>
    </DividerContainer>
</template>

<style scoped>
.visualizer-container {
}
</style>