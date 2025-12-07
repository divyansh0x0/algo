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
})
onMounted(() => {
    if (!divider.value || !container.value) {
        return
    }

    const divider_comp = divider.value;
    let dragging = false;
    divider_comp.onmousedown = () => {
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
                return
            }
            const container_bounds = container.value.getBoundingClientRect();
            const x_pos = Math.max(props.padding + container_bounds.left, Math.min(e.clientX, container_bounds.width - props.padding));

            const left_flex_basis = x_pos / container_bounds.width * 100;
            const right_flex_basis = 100 - left_flex_basis;
            console.log("dragging", left.value, right.value, x_pos);

            if (left.value && right.value) {
                left.value.style.flex = `0 0 ${left_flex_basis}%`;
                right.value.style.flex = `0 0 ${right_flex_basis}%`;
            }
            divider_comp.style.left = `${left.value?.clientWidth}px`;
        }
    });
    window.addEventListener("resize", () => {
        divider_comp.style.left = `${left.value?.clientWidth}px`;
    })
})
</script>

<template>
    <div ref="container" style="display: flex; position: relative" v-bind="$attrs">
        <div ref="left" style="flex: 1">
            <slot name="left"/>
        </div>
        <div ref="divider" class="slider" style=""/>
        <div ref="right" style="flex: 1">
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
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-color);
    cursor: ew-resize;
    opacity: 0;
    transition: opacity var(--transition-speed);

    &:hover, &.active {
        opacity: 1;
    }
}
</style>