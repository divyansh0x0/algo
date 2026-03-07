<script lang="ts" setup>
import BaseIcon from '../base/BaseIcon.vue';

const divider = ref<HTMLDivElement | null>(null);
const right = ref<HTMLElement | null>(null);
const left = ref<HTMLElement | null>(null);
const container = ref<HTMLDivElement | null>(null);

const props = defineProps({
    padding: {
        type: Number,
        default: 100,
    }
});

let dragging = false;
let mouseDownX = 0;

function dragMove(x?: number): void {
    if (x === undefined) return;
    if (dragging) {
        if (!divider.value || !container.value) return;

        const rect = container.value.getBoundingClientRect();
        const dividerBounds = divider.value.getBoundingClientRect();
        const x_pos_centered = x + (dividerBounds.left + dividerBounds.width / 2) - mouseDownX;
        const xPos = Math.max(props.padding + rect.left, Math.min(x_pos_centered, rect.width - props.padding));
        const rightWidth = Math.max(rect.width - xPos, 0);
        const ratio = rightWidth/rect.width;
        if (right.value) {
            right.value.style.flex = `${ratio}`;
        }
        if (left.value) {
            left.value.style.flex = `${1-ratio}`;
        }
        mouseDownX = x;
    }
}

function dragEnd(): void {
    dragging = false;
    divider.value?.classList.remove("active");
}

function dragStart(x: number): void {
    mouseDownX = x;
    dragging = true;
    divider.value?.classList.add("active");
}

onMounted(() => {
    divider.value?.addEventListener("mousedown", (e) => {
        dragStart(e.clientX);
    });
    divider.value?.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        if (touch) dragStart(touch.clientX);
    });

    window.addEventListener("mousemove", (e) => dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("touchmove", (e) => dragMove(e.touches[0]?.clientX));
    window.addEventListener("touchend", dragEnd);
});
</script>

<template>
    <div ref="container" class="pixel-split-container" v-bind="$attrs">
        <div ref="left" class="split-left">
            <slot name="left" />
        </div>

        <div ref="right" class="split-right">
            <!-- The grabber/divider -->
            <div ref="divider" class="split-divider">
                <div class="divider-line"/>
                <div class="divider-handle">
                    <BaseIcon name="material-symbols:drag-indicator" size="20" class="handle-icon" />
                </div>
            </div>

            <slot name="right" />
        </div>
    </div>
</template>

<style scoped>
.pixel-split-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.split-left {
    width: 50%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.split-right {
    position: relative;
    width: 50%;
    height: 100%;
    background-color: var(--color-background);
}

.split-divider {
    z-index: 10;
    width: 24px;
    height: 100%;
    position: absolute;
    left: 0;
    transform: translateX(-50%);
    background: transparent;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
}

.divider-line {
    position: absolute;
    height: 100%;
    width: var(--border-width-sm);
    background-color: var(--color-border);
    left: 50%;
    transform: translateX(-50%);
    transition: background-color var(--transition-speed);
}

.split-divider:hover .divider-line,
.split-divider.active .divider-line {
    background-color: var(--color-primary);
    width: var(--border-width-md);
}

.divider-handle {
    width: 24px;
    height: 48px;
    background-color: var(--color-surface);
    border: var(--border-pixel);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 11;
    box-shadow: 2px 2px 0px 0px var(--color-shadow);
    transition: transform 0.1s, box-shadow 0.1s, background-color 0.1s;
}

.split-divider:hover .divider-handle,
.split-divider.active .divider-handle {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    border-color: var(--color-primary);
}

.split-divider:active .divider-handle,
.split-divider.active .divider-handle {
    transform: translate(2px, 2px);
    box-shadow: none;
}

.handle-icon {
    color: inherit;
}
</style>
