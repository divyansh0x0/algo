<script lang="ts" setup>
defineProps({
    loading: Boolean,
    hint: {
        type: String,
        default: 'Loading',
    },
});
</script>

<template>
    <div class="loader-wrapper">
        <Transition appear mode="out-in" name="fade">
            <div v-if="loading" key="loader" class="loader-overlay">
                <Icon class="loader-icon" height="200" name="svg-spinners:6-dots-scale" width="200"/>
                {{ hint }}
            </div>
            <slot v-else key="loaded-content"/>
        </Transition>
    </div>
</template>

<style scoped>
.loader-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    flex: 1;
    overflow: hidden;
}

.loader-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    backdrop-filter: blur(10px);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-md);
}

.loader-icon {
    width: 100px;
    height: 100px;
}


</style>