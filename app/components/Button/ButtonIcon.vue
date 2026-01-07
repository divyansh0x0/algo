<script lang="ts" setup>
const props = defineProps({
    icon: String
});
</script>

<template>
    <button v-bind="$attrs">
        <slot/>
        <Icon v-if="props.icon" :name="props.icon" inline/>
    </button>
</template>

<style scoped>

</style>