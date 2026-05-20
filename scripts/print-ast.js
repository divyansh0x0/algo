"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var YLexer_1 = require("../app/lib/core/yasl/parser/YLexer");
var YParser_1 = require("../app/lib/core/yasl/parser/YParser");
var PrettyPrinterVisitor_1 = require("../app/lib/core/yasl/visitors/PrettyPrinterVisitor");
var YAst_1 = require("../app/lib/core/yasl/YAst");
var input = process.argv[2];
if (!input) {
    console.error('Usage: npx tsx scripts/print-ast.ts "<code>" OR <file-path>');
    console.error('Example 1 (inline): npx tsx scripts/print-ast.ts "let x = 10;"');
    console.error('Example 2 (file):   npx tsx scripts/print-ast.ts examples/yasl/01_variables.yasl');
    process.exit(1);
}
// Check if the input is a valid file path, otherwise treat it as raw code
var code = input;
if (fs_1.default.existsSync(input)) {
    code = fs_1.default.readFileSync(input, 'utf-8');
    console.log("\u001B[36m--- Reading from File: ".concat(input, " ---\u001B[0m\n"));
}
console.log('\x1b[36m--- Input Code ---\x1b[0m');
console.log(code);
console.log('\x1b[36m------------------\x1b[0m\n');
var lexer = new YLexer_1.YLexer(code);
var tokens = lexer.getTokens();
console.log('\x1b[36m--- Tokens ---\x1b[0m');
tokens.forEach(function (t) { return console.log("\u001B[33m[".concat(t.type, "]\u001B[0m '").concat(t.lexeme, "'")); });
console.log('\x1b[36m--------------\x1b[0m\n');
var parser = new YParser_1.YParser(tokens, lexer.getLineMap());
var program = parser.getProgram();
if (parser.getErrors().length > 0) {
    console.error('\x1b[31m--- Parser Errors ---\x1b[0m');
    parser.getErrors().forEach(function (e) { return console.error("\u001B[31m".concat(e.message, "\u001B[0m")); });
    console.error('\x1b[31m---------------------\x1b[0m\n');
}
var prettyPrinter = new PrettyPrinterVisitor_1.PrettyPrinterVisitor();
console.log('\x1b[36m--- Generated AST ---\x1b[0m');
var statements = program.getStatements();
if (statements.length === 0) {
    console.log('\x1b[90m(Empty AST / No statements parsed)\x1b[0m');
}
else {
    for (var i = 0; i < statements.length; i++) {
        console.log("\u001B[36mStatement ".concat(i + 1, " (Pretty Printed):\u001B[0m"));
        console.log(prettyPrinter.visit(statements[i]));
        console.log("\n\u001B[36mStatement ".concat(i + 1, " (AST Tree):\u001B[0m"));
        printTree(statements[i]);
        console.log('\n\x1b[36m---------------------\x1b[0m\n');
    }
}
function printTree(node, prefix, isRoot, isTail, key) {
    if (prefix === void 0) { prefix = ''; }
    if (isRoot === void 0) { isRoot = true; }
    if (isTail === void 0) { isTail = true; }
    if (key === void 0) { key = ''; }
    var IGNORED_KEYS = ['debugId', 'startIndex', 'endIndex', 'types', 'type'];
    var keyStr = key ? "\u001B[36m".concat(key, "\u001B[0m: ") : '';
    var prefixConnector = '';
    var childPrefix = prefix;
    if (!isRoot) {
        var connector = isTail ? '└── ' : '├── ';
        prefixConnector = "\u001B[90m".concat(prefix).concat(connector, "\u001B[0m");
        childPrefix = prefix + (isTail ? '    ' : '│   ');
    }
    if (node === null || node === undefined) {
        console.log("".concat(prefixConnector).concat(keyStr, "\u001B[90mnull\u001B[0m"));
        return;
    }
    if (typeof node !== 'object') {
        var valColor = '\x1b[35m'; // magenta for numbers/booleans
        if (typeof node === 'string')
            valColor = '\x1b[33m'; // yellow for strings
        console.log("".concat(prefixConnector).concat(keyStr).concat(valColor).concat(node, "\u001B[0m"));
        return;
    }
    var nodeTypeName = '';
    if (Array.isArray(node)) {
        nodeTypeName = "\u001B[34m[Array(".concat(node.length, ")]\u001B[0m");
    }
    else if ('type' in node && typeof node.type === 'number') {
        nodeTypeName = "\u001B[32m".concat(YAst_1.YNodeType[node.type] || node.type, "\u001B[0m");
    }
    else if ('type' in node && typeof node.type === 'string') {
        nodeTypeName = "\u001B[32m".concat(node.type, "\u001B[0m");
    }
    else {
        nodeTypeName = "\u001B[34mObject\u001B[0m";
    }
    console.log("".concat(prefixConnector).concat(keyStr).concat(nodeTypeName));
    var entries = [];
    if (Array.isArray(node)) {
        entries = node.map(function (n, i) { return [i.toString(), n]; });
    }
    else {
        entries = Object.entries(node).filter(function (_a) {
            var k = _a[0];
            return !IGNORED_KEYS.includes(k);
        });
    }
    entries.forEach(function (_a, i) {
        var k = _a[0], v = _a[1];
        var isLast = i === entries.length - 1;
        printTree(v, childPrefix, false, isLast, k);
    });
}
