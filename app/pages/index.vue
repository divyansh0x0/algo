<script lang="ts" setup>
import { Visualizer, type World } from "../lib/core/engine";
import {
    TracerType,
    type YTracer,
    type YTracerArraySwap,
    type YTracerDeclareVariable
} from "../lib/core/yasl/tracer/YTracers";

const isIDELoaded = ref(false);
const visualizer = new Visualizer();
const code = `let x = [1,2,3]
x.swap(0,1)
x.swap(1,2)
x.swap(0,1)
`;
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
            console.log("VALUE:",declarationTrace.assigned_value);
            if (value !== undefined && value !== null) {
                switch (typeof value) {
                    case "undefined":
                        break;
                    case "object":
                        visualizer.addArray(name, value.getArray());
                        break;
                    case "boolean":
                        break;
                    case "number":
                        break;
                    case "string":
                        break;
                    case "function":
                        break;
                    case "symbol":
                        break;
                    case "bigint":
                        break;

                }
            }
            break;
        }
        case TracerType.DECLARE_FUNCTION:
            break;
        case TracerType.ASSIGN_VARIABLE:
            break;
        case TracerType.BINARY_OPERATION:
            break;
        case TracerType.UNARY_OPERATION:
            break;
        case TracerType.CALL:
            break;
        case TracerType.RETURN:
            break;
        case TracerType.JUMP:
            break;
        case TracerType.ENTER_BLOCK:
            break;
        case TracerType.EXIT_BLOCK:
            break;
        case TracerType.ARRAY_READ:
            break;
        case TracerType.ARRAY_WRITE:
            break;
        case TracerType.ARRAY_SWAP: {
            const swapTracer = trace as YTracerArraySwap;
            const name = swapTracer.array_name;
            visualizer.swapArrayElements(name, swapTracer.index1, swapTracer.index2);

            break;
        }
        case TracerType.CONDITION_EVALUATION:
            break;
        case TracerType.COMPARE:
            break;

    }


}
let interval: NodeJS.Timeout;
let i = 0;
function onRun(traces: YTracer[]) {
    if(traces.length == 0) return;
    visualizer.resetScene();
    traceReceiver(traces[0]!); // Play first trace instantly.
    i = 1;
    interval = setInterval(() => {
        if (i >= traces.length){
            clearInterval(interval);
            return;
        }
        traceReceiver(traces[i]!);
        i++;
    }, 1000);
}

onUnmounted(() => {
    clearInterval(interval);
})
</script>

<template>


    <DividerContainer class="divider" style="height: 100vh; width: 100vw; overflow: hidden;">
        <template #left>
            <VisualizerCanvas :on-initialized="onInitialized"/>
        </template>
        <template #right>
            <OverlayLoader :loading="!isIDELoaded">
                <EditorContainer :on-run-complete="onRun" :code="code"/>
            </OverlayLoader>
        </template>
    </DividerContainer>
</template>

<style scoped>
.visualizer-container {
}
</style>