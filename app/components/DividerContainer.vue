<script lang="ts" setup>
const divider = ref<HTMLDivElement | null>(null);
const left = ref<HTMLElement | null>(null);
const right = ref<HTMLElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
const props = defineProps({
    padding: {
        type: Number,
        default: 100,
    }
});
onMounted(() => {
    if (!divider.value || !container.value) {
        return;
    }

    const divider_comp = divider.value;
    let dragging = false;
    let mouse_down_x = 0;
    divider_comp.onmousedown = (e) => {
        mouse_down_x = e.clientX;
        dragging = true;
        divider_comp.classList.add("active");
    };
    window.addEventListener("mouseup", () => {
        dragging = false;
        divider_comp.classList.remove("active");
    });
    window.addEventListener("mousemove", (e: MouseEvent) => {
        if (dragging) {
            if (!divider.value || !container.value) {
                return;
            }
            const container_bounds = container.value.getBoundingClientRect();
            const divider_bounds = divider_comp.getBoundingClientRect();
            const x_pos_centered = e.clientX + (divider_bounds.left + divider_bounds.width / 2) - mouse_down_x;
            const x_pos = Math.max(props.padding + container_bounds.left, Math.min(x_pos_centered, container_bounds.width - props.padding));
            const left_flex_basis = x_pos / container_bounds.width * 100;
            const right_flex_basis = 100 - left_flex_basis;
            if (left.value && right.value) {
                left.value.style.flex = `0 0 ${left_flex_basis}%`;
                right.value.style.flex = `0 0 ${right_flex_basis}%`;
            }
            divider_comp.style.left = `${left.value?.clientWidth}px`;
            mouse_down_x = e.clientX;
        }
    });
    window.addEventListener("resize", () => {
        divider_comp.style.left = `${left.value?.clientWidth}px`;
    });
});
</script>

<template>
    <div ref="container" class="container" v-bind="$attrs">
        <div ref="left" class="left">
            <slot name="left"/>
        </div>
        <div ref="divider" class="slider" style="">
            <Icon class="icon" name="material-symbols:drag-indicator" width="24"/>
        </div>
        <div ref="right" class="right">
            <slot name="right"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    display: flex;
    position: relative
}
.slider {
    z-index: 1;
    width: 30px;
    height: 100%;
    position: absolute;
    left: 50%;
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
.right, .left{
    flex: 1;
    background-color: var(--color-background);
    overflow: auto;
}
</style>