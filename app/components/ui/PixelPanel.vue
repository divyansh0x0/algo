<script lang="ts" setup>
import BaseCard from '../base/BaseCard.vue';
defineProps({
    title: { type: String, required: false, default: "Title" },
    noPadding: { type: Boolean, default: false }
});
</script>

<template>
    <BaseCard class="pixel-panel" v-bind="$attrs">
        <div v-if="title || $slots.header" class="pixel-panel-header">
            <slot name="header">
                <span class="pixel-panel-title">{{ title }}</span>
            </slot>
        </div>
        <div :class="['pixel-panel-body', { 'no-padding': noPadding }]">
            <slot />
        </div>
    </BaseCard>
</template>

<style scoped>
.pixel-panel {
    background-color: var(--color-surface);
    border: var(--border-pixel);
    box-shadow: var(--shadow-pixel-sm);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.pixel-panel-header {
    background-color: var(--color-surface-container-high);
    border-bottom: var(--border-pixel);
    padding: var(--padding-sm) var(--padding-md);
    display: flex;
    align-items: center;
    min-height: 40px;
}

.pixel-panel-title {
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-on-surface);
}

.pixel-panel-body {
    padding: var(--padding-md);
    flex: 1;
    overflow: auto;
    background-color: var(--color-surface);
}

.pixel-panel-body.no-padding {
    padding: 0;
}
</style>
