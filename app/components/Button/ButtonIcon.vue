<script lang="ts" setup>
const props = defineProps({
    icon: String
})
</script>

<template>
    <button v-bind="$attrs">
        <Icon v-if="props.icon" :name="props.icon"/>
    </button>
</template>

<style scoped>

</style>