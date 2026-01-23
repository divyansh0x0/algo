<script lang="ts" setup>


const ide_container = ref<HTMLDivElement | null>(null);
let ide: unknown = null;
onMounted(async () => {
    const editor = await import("@/lib/core/editor/view/EditorView");
    if (ide_container.value) {
        ide = new editor.EditorView(ide_container.value);
    }
});

function onRunBtnClick() {
    if (ide && typeof ide == "object" && "run" in ide && typeof ide["run"] === "function") {
        // ide.run();
    }
}
</script>


<template>
    <div class="ide-wrapper">
        <div>
            <ButtonIcon ref="runBtn" icon="mdi:play" @click="onRunBtnClick"/>
        </div>
        <div ref="ide_container" class="container"/>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: fit-content;
    min-height: 30px;
    background-color: rgba(255, 255, 255, 0.18);
    border-radius: var(--border-radius);
    padding: var(--padding-sm);
    &:focus{
        border: 1px solid rgba(255, 255, 255, 0.12);
    }
}

.ide-wrapper {
    height: 100%;
    width: 100%;
    padding: var(--padding-md);
    overflow-y: auto;
}
</style>