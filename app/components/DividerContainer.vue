<script lang="ts" setup>
const divider = ref<HTMLDivElement | null>(null);
const right = ref<HTMLElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
const props = defineProps({
    padding: {
        type: Number,
        default: 100,
    }
});
let dragging = false;
let mouse_down_x = 0;

function dragMove(x: number): void {
    if (dragging) {
        if (!divider.value || !container.value) {
            return;
        }
        const container_bounds = container.value.getBoundingClientRect();
        const divider_bounds = divider.value.getBoundingClientRect();
        const x_pos_centered = x + (divider_bounds.left + divider_bounds.width / 2) - mouse_down_x;
        const x_pos = Math.max(props.padding + container_bounds.left, Math.min(x_pos_centered, container_bounds.width - props.padding));
        const right_width = Math.max(window.innerWidth - x_pos, 0);
        if (right.value) {
            right.value.style.width = `${right_width}px`;
        }
        mouse_down_x = x;
    }
}

function dragEnd(): void {
    dragging = false;
    divider.value?.classList.remove("active");
}

function dragStart(x: number): void {
    mouse_down_x = x;
    dragging = true;
    divider.value?.classList.add("active");
}

onMounted(() => {
    divider.value?.addEventListener("mousedown", (e) => {
        dragStart(e.clientX);
    });
    divider.value?.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        if (touch)
            dragStart(touch.clientX);
    });
    window.addEventListener("mouseup", () => {
        dragEnd();
    });

    window.addEventListener("touchend", () => {
        dragEnd();
    });
    window.addEventListener("mousemove", (e) => {
        dragMove(e.clientX);
    });

    window.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        if (touch)
            dragMove(touch.clientX);
    });
});
</script>

<template>
    <div ref="container" v-bind="$attrs">
        <div ref="left" class="left">
            <slot name="left"/>
        </div>
        <div ref="right" class="right">
            <div ref="divider" class="slider" style="">
                <Icon class="icon" name="material-symbols:drag-indicator" width="24"/>
            </div>
            <slot name="right"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.slider {
    z-index: 1;
    width: 30px;
    height: 100%;
    position: absolute;
    left: 0;
    transform: translateX(-50%);
    background: none;
    cursor: ew-resize;
    opacity: 1;
    transition: opacity var(--transition-speed);

    &:hover, &.active {
        opacity: 1;
    }

    &:before {
        content: "";
        height: 100%;
        width: 10px;
        background: var(--color-tertiary);
        position: absolute;
        z-index: 1;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        backdrop-filter: blur(10px);
    }

    .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--color-on-tertiary);
        z-index: 1;
    }
}

.left {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.right {
    position: absolute;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    background-color: var(--color-background);
}
</style>