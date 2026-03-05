<script lang="ts" setup>
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
    if(x === undefined)
        return;
    if (dragging) {
        if (!divider.value || !container.value) {
            return;
        }
        const rect = container.value.getBoundingClientRect();
        const dividerBounds = divider.value.getBoundingClientRect();
        const x_pos_centered = x + (dividerBounds.left + dividerBounds.width / 2) - mouseDownX;
        const xPos = Math.max(props.padding + rect.left, Math.min(x_pos_centered, rect.width - props.padding));
        const rightWidth = Math.max(rect.width - xPos, 0);
        if (right.value) {
            right.value.style.width = `${rightWidth}px`;
        }
        if(left.value) {
            left.value.style.width = `${xPos}px`;
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
        if (touch)
            dragStart(touch.clientX);
    });

    window.addEventListener("mousemove", (e)=> dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("touchmove", (e)=> dragMove(e.touches[0]?.clientX));

    window.addEventListener("touchend",  dragEnd);
});
</script>

<template>
    <div ref="container" class="divider-container" v-bind="$attrs">
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
.divider-container{
    display: flex;
    flex-direction: row;
}
.left {
    width: 50%;
    height: 100%;
    overflow: hidden;
}

.right {
    position: relative;
    width: 50%;
    height: 100%;
    background-color: var(--color-background);
}
</style>