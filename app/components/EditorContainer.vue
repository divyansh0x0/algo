<script lang="ts" setup>


import type { EditorView } from "../lib/core/editor/view/EditorView";
import { Lexer, Parser } from "../lib/core/yasl";
import { TracerVisitor } from "../lib/core/yasl/visitors/TracerVisitor";

const editorEl = ref<HTMLDivElement | null>(null);
const yaslOutput = ref<HTMLDivElement | null>(null);
let ide: unknown = null;
const code = `let x = 100
let y = 100
print(x+y)
`;
onMounted(async () => {
    const editor = await import("@/lib/core/editor/view/EditorView");
    if (editorEl.value) {
        const view = new editor.EditorView(editorEl.value);
        view.setCode(code);
        ide = view;
    }

});

function onRunBtnClick() {
    console.log(ide);

    if (ide && typeof ide == "object" && "getCode" in ide && typeof ide["getCode"] === "function") {
        const code = ide.getCode();
        const lexer = new Lexer(code);

        const parser = new Parser(lexer.getTokens(), lexer.getLineMap());
        const visitor = new TracerVisitor(lexer.getLineMap());
        // if(parser.getErrors())
        const parsingErrors = parser.getErrors();

        for (const error of parsingErrors) {
            console.error("PARSING ERROR", error);
        }
        const statements = parser.getProgram().getStatements();

        visitor.addTraceListener((trace) => {
            console.log("Trace:", trace);
        });
        visitor.setStdOut((outputStr) => {
            const out = yaslOutput.value;
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
            <div ref="yaslOutput" class="yasl-std-output"></div>
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
.editor-wrapper{
    flex: 0.7 0;
}
.yasl-console{
    flex: 0.3 0;
}
.yasl-console,.editor-wrapper{
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