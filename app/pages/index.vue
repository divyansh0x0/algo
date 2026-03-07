<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Visualizer, type World } from "../lib/core/engine";
import { TracerType, type YTracer, type YTracerArraySwap, type YTracerDeclareVariable } from "../lib/core/yasl/tracer/YTracers";
import PixelSplitPane from '../components/ui/PixelSplitPane.vue';
import PixelLoader from '../components/ui/PixelLoader.vue';
import VisualizerPanel from '../components/feature/visualizer/VisualizerPanel.vue';
import EditorPanel from '../components/feature/editor/EditorPanel.vue';

const isIDELoaded = ref(false);
const visualizer = new Visualizer();
const code = `let x = [1,2,3]
x.swap(0,1)
x.swap(1,2)
x.swap(0,1)`;

onMounted(() => {
    isIDELoaded.value = true;
});

function onInitialized(world: World, ctx: CanvasRenderingContext2D) {
    visualizer.setScene(world, ctx);
}

function traceReceiver(trace: YTracer) {
    switch (trace.type) {
        case TracerType.DECLARE_VARIABLE: {
            const declarationTrace = trace as YTracerDeclareVariable;
            const name = declarationTrace.variable_name;
            const valueWrapper = declarationTrace.assigned_value;
            const value = valueWrapper?.value;
            if (value !== undefined && value !== null) {
                switch (typeof value) {
                    case "object":
                        visualizer.addArray(name, value.getArray());
                        break;
                }
            }
            break;
        }
        case TracerType.ARRAY_SWAP: {
            const swapTracer = trace as YTracerArraySwap;
            const name = swapTracer.array_name;
            visualizer.swapArrayElements(name, swapTracer.index1, swapTracer.index2);
            break;
        }
    }
}

let interval: NodeJS.Timeout;
let i = 0;

function onRun(traces: YTracer[]) {
    visualizer.resetScene();
    if (traces.length === 0) return;
    traceReceiver(traces[0]!); // Play first trace instantly
    i = 1;
    clearInterval(interval);

    interval = setInterval(() => {
        if (i >= traces.length) {
            clearInterval(interval);
            return;
        }
        traceReceiver(traces[i]!);
        i++;
    }, 1000);
}

onUnmounted(() => {
    clearInterval(interval);
});
</script>

<template>
    <div class="page-container">
        <PixelSplitPane style="height: 100%; width: 100%;">
            <template #left>
                <VisualizerPanel :on-initialized="onInitialized" />
            </template>

            <template #right>
                <PixelLoader :loading="!isIDELoaded" hint="INITIALIZING STUDIO...">
                    <EditorPanel :code="code" :on-run-complete="onRun" />
                </PixelLoader>
            </template>
        </PixelSplitPane>
    </div>
</template>

<style scoped>
.page-container {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    background-color: var(--color-background);
}
</style>