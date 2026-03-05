<script lang="ts" setup>
import BaseButton from '../base/BaseButton.vue';
import BaseIcon from '../base/BaseIcon.vue';

const props = defineProps({
    icon: { type: String, required: false },
    variant: { type: String as PropType<'primary'|'secondary'|'ghost'>, default: 'primary' },
    disabled: { type: Boolean, default: false },
});
</script>

<template>
    <BaseButton 
        :class="['pixel-button', `pixel-button-${variant}`, { 'is-disabled': disabled }]"
        :disabled="disabled"
        v-bind="$attrs"
    >
        <slot/>
        <BaseIcon v-if="icon" :name="icon" class="pixel-button-icon" />
    </BaseButton>
</template>

<style scoped>
.pixel-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    
    padding: var(--padding-sm) var(--padding-md);
    font-family: var(--font-family);
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    
    border-radius: var(--border-radius);
    transition: transform var(--transition-speed), background-color var(--transition-speed);
}

.pixel-button:active:not(.is-disabled) {
    transform: translate(2px, 2px);
    box-shadow: none !important;
}

/* Primary Variant */
.pixel-button-primary {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    border: var(--border-pixel);
    box-shadow: var(--shadow-pixel-md);
}

.pixel-button-primary:hover:not(.is-disabled) {
    background-color: var(--color-primary-hover);
}

.pixel-button-primary:active:not(.is-disabled) {
    background-color: var(--color-primary-active);
}

/* Secondary Variant */
.pixel-button-secondary {
    background-color: var(--color-surface);
    color: var(--color-on-surface);
    border: var(--border-pixel);
    box-shadow: var(--shadow-pixel-md);
}

.pixel-button-secondary:hover:not(.is-disabled) {
    background-color: var(--color-surface-hover);
}

.pixel-button-secondary:active:not(.is-disabled) {
    background-color: var(--color-surface-active);
}

/* Ghost Variant (Icon only typically) */
.pixel-button-ghost {
    background-color: transparent;
    color: var(--color-on-surface);
    border: 2px solid transparent;
    padding: var(--padding-sm);
}

.pixel-button-ghost:hover:not(.is-disabled) {
    background-color: var(--color-surface-hover);
    border: 2px solid var(--color-border);
}

.pixel-button-ghost:active:not(.is-disabled) {
    background-color: var(--color-surface-active);
    border: 2px solid var(--color-border);
}

.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none !important;
    transform: translate(2px, 2px);
}

.pixel-button-icon {
    font-size: 1.2em;
}
</style>
