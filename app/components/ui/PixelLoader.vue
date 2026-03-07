<script lang="ts" setup>
import BaseIcon from '../base/BaseIcon.vue';

defineProps({
    loading: Boolean,
    hint: {
        type: String,
        default: "LOADING...",
    },
});
</script>

<template>
    <div class="pixel-loader-wrapper">
        <Transition appear mode="out-in" name="fade">
            <div v-if="loading" key="loader" class="pixel-loader-overlay">
                <div class="pixel-spinner-box">
                    <BaseIcon class="loader-icon" size="64" name="svg-spinners:blocks-scale" />
                    <span class="loader-text">{{ hint }}</span>
                </div>
            </div>
            <slot v-else key="loaded-content" />
        </Transition>
    </div>
</template>

<style scoped>
.pixel-loader-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    flex: 1;
    overflow: hidden;
}

.pixel-loader-overlay {
    position: absolute;
    inset: 0;
    /* Dotted/pixel grid background overlay effect */
    background-color: rgba(15, 15, 19, 0.7);
    background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
    background-size: 4px 4px;

    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 50;
}

.pixel-spinner-box {
    background-color: var(--color-surface);
    border: var(--border-pixel-primary);
    box-shadow: var(--shadow-pixel-md);
    padding: var(--padding-lg) var(--spacing-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
}

.loader-icon {
    color: var(--color-primary);
}

.loader-text {
    font-family: var(--font-family);
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-on-surface);
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    50% {
        opacity: 0;
    }
}

/* Simple fade transition since we removed smooth transitions globally, but a quick toggle is nice */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s step-end;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
