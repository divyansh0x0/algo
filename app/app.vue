<script lang="ts" setup>
import { Lexer, Parser } from "./lib/core/yasl";

onMounted(() => {
    const code = `
let a = 5`;
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.getTokens(), lexer.getLineMap());
    console.log("Tokens:", lexer.getTokens());
    // const ast = parser.getProgram();
    // console.log(ast);
    // const tracer = new ProgramTracer();
    // if (ast.root)
    //     tracer.run(ast.root);
    // else
    //     console.log("No AST root found");
});

</script>
<template>
    <ButtonTheme/>
    <main :class="$colorMode.value" class="h-screen w-screen overflow-hidden">
        <NuxtPage/>
    </main>
</template>
<style scoped></style>
