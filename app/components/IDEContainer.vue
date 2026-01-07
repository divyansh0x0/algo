<script lang="ts" setup>

const ide_container = ref<HTMLDivElement | null>(null);
let ide: unknown = null;
onMounted(async () => {
    const editor = await import("@/lib/core/editor");
    if (ide_container.value) {
        ide = new editor.IDE(ide_container.value);
    }
});

function onRunBtnClick() {
    if (ide && typeof ide == "object" && "run" in ide && typeof ide["run"] === "function") {
        ide.run();
    }
}
</script>


<template>
    <div class="wrapper">
        <div>
            <ButtonIcon ref="runBtn" icon="mdi:play" @click="onRunBtnClick"/>
        </div>
        <div id="editor-container" ref="ide_container"/>
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