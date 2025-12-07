<script lang="ts" setup>

const ide_container = ref<HTMLDivElement | null>(null);
onMounted(async () => {
    const editor = await import("@/lib/core/editor");
    if (ide_container.value) {
        const ide = new editor.IDE(ide_container.value);
    }
})
</script>

<template>
    <div class="wrapper">
        <div id="editor-container" ref="ide_container">

        </div>
    </div>
</template>

<style scoped>
#editor-container {
    height: 100%;
    border-radius: var(--border-radius);
}

.wrapper {
    height: 100%;
    width: 100%;
    padding: var(--padding-md);
    overflow-y: auto;
}
</style>