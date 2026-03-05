<script lang="ts" setup>
import PixelButton from '../../ui/PixelButton.vue';

const emit = defineEmits(['run']);

function handleRun() {
    emit('run');
}
</script>

<template>
    <div class="editor-toolbar">
        <div class="toolbar-group">
            <PixelButton variant="primary" icon="mdi:play" @click="handleRun">
                Run Code
            </PixelButton>
        </div>

        <div class="toolbar-group">
            <slot name="extra" />
        </div>
    </div>
</template>

<style scoped>
.editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--padding-sm);
    background-color: var(--color-surface-container-highest);
    border-bottom: var(--border-pixel);
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}
</style>
