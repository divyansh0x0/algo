<script lang="ts" setup>
// BaseButton: Headless, unstyled button component to handle core click/disabled logic
const props = defineProps({
    disabled: { type: Boolean, default: false },
    type: { type: String as PropType<'button'|'submit'|'reset'>, default: 'button' },
});
const emit = defineEmits(['click']);

function onClick(e: Event) {
    if (!props.disabled) {
        emit('click', e);
    }
}
</script>

<template>
    <button 
        :type="type" 
        :disabled="disabled" 
        v-bind="$attrs"
        @click="onClick"
    >
        <slot />
    </button>
</template>
