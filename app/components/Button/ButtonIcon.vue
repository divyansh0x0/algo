<script lang="ts" setup>
const props = defineProps({
    icon: String
})
</script>

<template>
    <button v-bind="$attrs">
        <slot/>
        <Icon  v-if="props.icon" inline :name="props.icon"/>
    </button>
</template>

<style scoped>

</style>