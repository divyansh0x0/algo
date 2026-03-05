<script lang="ts" setup>
const props = defineProps({
    name: { type: String, required: true },
    size: { type: [String, Number], default: '1em' },
});
</script>

<template>
    <Icon 
        :name="name" 
        :width="size"
        :height="size"
        inline 
        v-bind="$attrs"
    />
</template>
