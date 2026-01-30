<script lang="ts" setup>


import { YLexer, YParser } from "../lib/core/yasl";
import type { YTracer } from "../lib/core/yasl/tracer/YTracers";
import { TracerVisitor } from "../lib/core/yasl/visitors/TracerVisitor";

const editorEl = ref<HTMLDivElement | null>(null);
const outputEl = ref<HTMLDivElement | null>(null);
let editorView: any = null;

const props = defineProps({
    onRunComplete: {
        type: Function as PropType<(traces: YTracer[]) => void>,
        required: false,
        default: undefined,
    },
    code: {
        type: String,
        required: false,
        default: "// Write your code here",
    }
});


onMounted(async () => {
    const editor = await import("@/lib/core/editor/view/EditorView");
    if (editorEl.value) {
        editorView = new editor.EditorView(editorEl.value);
    }
    setCode(props.code);
});

function setCode(newCode: string) {
    if (editorView) {
        editorView.setCode(newCode);
    }
}

watch(() => props.code, setCode);

function onRunBtnClick() {
    console.log(editorView);

    if (editorView && typeof editorView == "object" && "getCode" in editorView && typeof editorView["getCode"] === "function") {
        const code = editorView.getCode();
        const lexer = new YLexer(code);

        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        const visitor = new TracerVisitor(lexer.getLineMap());
        // if(parser.getErrors())
        const parsingErrors = parser.getErrors();

        for (const error of parsingErrors) {
            console.error("PARSING ERROR", error);
        }
        const statements = parser.getProgram().getStatements();
        const traces = Array<YTracer>();
        visitor.addTraceListener((trace) => traces.push(trace));

        visitor.setStdOut((outputStr) => {
            const out = outputEl.value;
            if (out == null) {
                return;
            }

            const time = new Date().toLocaleTimeString();
            out.innerHTML += `<div class="yasl-std-output">[${time}] ${outputStr}</div>`;
        });

        try {
            for (const statement of statements) {
                statement.accept(visitor);
            }
        } catch (error) {
            console.log("ERROR", error);
            console.log(visitor.getError());
        }

        if (props.onRunComplete)
            props.onRunComplete(traces);
    }
}
</script>


<template>
    <div class="container">
        <div class="editor-wrapper">
            <div class="toolbar">
                <ButtonIcon ref="runBtn" icon="mdi:play" @click="onRunBtnClick"/>
            </div>
            <div ref="editorEl" class="editor"/>
        </div>
        <div class="yasl-console">
            <h3> Terminal </h3>
            <div ref="outputEl" class="yasl-std-output"></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: var(--padding-md);
    background-color: var(--color-surface-container-low);
    overflow-y: auto;
    overflow-x: hidden;
}

.toolbar {
    //padding: var(--padding-md);
    height: max-content;
    max-height: fit-content;
    overflow: auto;
}

.editor {
    flex: 1;
    min-height: 30px;
    background-color: var(--color-surface-container-lowest);
    border-radius: var(--border-radius);
    border: 1px solid transparent;
    overflow: auto;
    padding: 0 0 100px;

    &:focus {
        border: 1px solid var(--color-secondary);
    }
}

.editor-wrapper {
    flex: 0.7 0;
}

.yasl-console {
    flex: 0.3 0;
}

.yasl-console, .editor-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: var(--spacing-sm);
    width: 100%;
    background-color: var(--color-surface-container-high);
    margin-top: var(--spacing-md);
    border-radius: var(--border-radius);
    padding: var(--padding-md);
    font-family: "JetBrains Mono", monospace;
    overflow-x: auto;
}

h3 {
    padding: 0 var(--padding-sm);
}

.yasl-std-output {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 100px;
    overflow: auto;
    background-color: var(--color-surface-container-lowest);
    border-radius: var(--border-radius);
    padding: var(--padding-sm);
}

.yasl-std-output {
    min-width: max-content;
}
</style>