<script lang="ts" setup>
const props = defineProps({
    logs: { type: Array as PropType<string[]>, default: () => [] }
});

const consoleRef = ref<HTMLDivElement | null>(null);

// Auto-scroll on new logs
watch(() => props.logs.length, () => {
    nextTick(() => {
        if (consoleRef.value) {
            consoleRef.value.scrollTop = consoleRef.value.scrollHeight;
        }
    });
});
</script>

<template>
    <div class="editor-console">
        <div class="console-header">
            <span class="console-title">TERMINAL</span>
        </div>
        <div class="console-output" ref="consoleRef">
            <div v-if="logs.length === 0" class="console-empty">
                > Ready.
            </div>
            <div v-for="(log, idx) in logs" :key="idx" class="console-line" v-html="log" />
        </div>
    </div>
</template>

<style scoped>
.editor-console {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-surface-container-lowest);
    border-top: var(--border-width-md) solid var(--color-border);
    font-family: "JetBrains Mono", monospace, 'Courier New', Courier;
}

.console-header {
    background-color: var(--color-border);
    padding: 4px var(--padding-sm);
    display: flex;
    align-items: center;
}

.console-title {
    color: var(--color-background);
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.1em;
}

.console-output {
    flex: 1;
    overflow-y: auto;
    padding: var(--padding-sm);
    font-size: 13px;
    color: var(--color-on-surface);
}

.console-line {
    margin-bottom: 2px;
    word-break: break-all;
}

.console-empty {
    color: var(--color-on-surface-variant);
    font-style: italic;
}

/* Scoped style for the inner injected HTML from original EditorContainer logic */
:deep(.yasl-std-output) {
    display: block;
}
</style>
