<script lang="ts" setup>
const divider = ref<HTMLDivElement | null>(null);
const left = ref<HTMLElement | null>(null);
const right = ref<HTMLElement | null>(null);
const props = defineProps({
    padding: {
        type: Number,
        default: 16,
    }
});
onMounted(() => {
    if (!divider.value) {
        return;
    }

    const divider_comp = divider.value;
    let dragging = false;

    divider_comp.onmousedown = (e: MouseEvent) => {
        dragging = true;
    };
    window.addEventListener("mouseup", (e: MouseEvent) => {
        dragging = false;
    });
    window.addEventListener("mousemove", (e: MouseEvent) => {
        if (dragging) {
            const x_pos = Math.max(props.padding, Math.min(e.clientX, window.innerWidth - props.padding));

            const left_flex_basis = x_pos / window.innerWidth;
            const right_flex_basis = 1 - left_flex_basis;

            if (left.value && right.value) {
                left.value.style.flex = `0 0 ${left_flex_basis}`;
                right.value.style.flex = `0 0 ${right_flex_basis}`;
            }
        }
    });
});
</script>

<template>
    <div style="display: flex;" v-bind="$attrs">
        <slot ref="left" name="left" style="flex: 0 0 50%"/>
        <div ref="divider"></div>
        <slot ref="right" name="right" style="flex: 0 0 50%"/>
    </div>
</template>
<style scoped>

</style>