<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { EditorView } from "../../../lib/core/editor/view/EditorView";
import type { YTracer } from "../../../lib/core/yasl/tracer/YTracers";
import { YLexer, YParser } from "../../../lib/core/yasl";
import { TracerVisitor } from "../../../lib/core/yasl/visitors/TracerVisitor";
import EditorToolbar from './EditorToolbar.vue';
import EditorConsole from './EditorConsole.vue';

const props = defineProps({
    onRunComplete: {
        type: Function as PropType<(traces: YTracer[]) => void>,
        required: false,
        default: null,
    },
    code: {
        type: String,
        required: false,
        default: "// Write your code here",
    }
});

const editorEl = ref<HTMLDivElement | null>(null);
const consoleLogs = ref<string[]>([]);
let editorView: unknown = null;

onMounted(async () => {
    const editor = await import("@/lib/core/editor/view/EditorView");
    if (editorEl.value) {
        editorView = new editor.EditorView(editorEl.value);
    }
    setCode(props.code);
});

function setCode(newCode: string) {
    if (editorView && editorView instanceof EditorView) {
        editorView.setCode(newCode);
    }
}

watch(() => props.code, setCode);

function runCode() {
    if (!(editorView && typeof editorView == "object" && "getCode" in editorView && typeof editorView["getCode"] === "function")) {
        return;
    }
    const code = editorView.getCode();
    const lexer = new YLexer(code);
    const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
    const visitor = new TracerVisitor(lexer.getLineMap());
    const parsingErrors = parser.getErrors();
    for (const error of parsingErrors) {
        console.error("PARSING ERROR", error);
    }
    const statements = parser.getProgram().getStatements();
    const traces = Array<YTracer>();
    visitor.addTraceListener((trace) => traces.push(trace));
    consoleLogs.value = [];
    visitor.setStdOut((outputStr) => {
        const time = new Date().toLocaleTimeString();
        consoleLogs.value.push(`[${time}] ${outputStr}`);
    });
    try {
        for (const statement of statements) {
            statement.accept(visitor);
        }
    } catch (error) {
        console.log("ERROR", error);
        console.log(visitor.getError());
        consoleLogs.value.push(`<span style="color:red">ERROR: ${error}</span>`);
    }
    if (props.onRunComplete) {
        props.onRunComplete(traces);
    }
}
</script>

<template>
    <div class="editor-panel">
        <EditorToolbar @run="runCode" />

        <div class="editor-workspace">
            <div ref="editorEl" class="editor" />
        </div>

        <div class="editor-footer">
            <EditorConsole :logs="consoleLogs" />
        </div>
    </div>
</template>

<style scoped>
.editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--color-surface-container-low);
}

.editor-workspace {
    flex: 0.7;
    position: relative;
    overflow: hidden;
}

.editor {
    position: absolute;
    inset: 0;
    overflow: auto;
    background-color: var(--color-surface-container-lowest);
}

/* Fix EditorView focus ring to match pixel UI */
.editor:focus {
    outline: var(--border-width-sm) solid var(--color-primary) !important;
}

.editor-footer {
    flex: 0.3;
    min-height: 150px;
    display: flex;
    flex-direction: column;
}
</style>
