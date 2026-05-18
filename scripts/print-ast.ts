import fs from 'fs';
import { YLexer } from '../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../app/lib/core/yasl/parser/YParser';
import { PrettyPrinterVisitor } from '../app/lib/core/yasl/visitors/PrettyPrinterVisitor';
import { YNodeType } from '../app/lib/core/yasl/YAst';

let input = process.argv[2];

if (!input) {
    console.error('Usage: npx tsx scripts/print-ast.ts "<code>" OR <file-path>');
    console.error('Example 1 (inline): npx tsx scripts/print-ast.ts "let x = 10;"');
    console.error('Example 2 (file):   npx tsx scripts/print-ast.ts examples/yasl/01_variables.yasl');
    process.exit(1);
}

// Check if the input is a valid file path, otherwise treat it as raw code
let code = input;
if (fs.existsSync(input)) {
    code = fs.readFileSync(input, 'utf-8');
    console.log(`\x1b[36m--- Reading from File: ${input} ---\x1b[0m\n`);
}

console.log('\x1b[36m--- Input Code ---\x1b[0m');
console.log(code);
console.log('\x1b[36m------------------\x1b[0m\n');

const lexer = new YLexer(code);
const tokens = lexer.getTokens();

console.log('\x1b[36m--- Tokens ---\x1b[0m');
tokens.forEach(t => console.log(`\x1b[33m[${t.type}]\x1b[0m '${t.lexeme}'`));
console.log('\x1b[36m--------------\x1b[0m\n');

const parser = new YParser(tokens, lexer.getLineMap());
const program = parser.getProgram();

if (parser.getErrors().length > 0) {
    console.error('\x1b[31m--- Parser Errors ---\x1b[0m');
    parser.getErrors().forEach(e => console.error(`\x1b[31m${e.message}\x1b[0m`));
    console.error('\x1b[31m---------------------\x1b[0m\n');
}

const prettyPrinter = new PrettyPrinterVisitor();

console.log('\x1b[36m--- Generated AST ---\x1b[0m');
const statements = program.getStatements();
if (statements.length === 0) {
    console.log('\x1b[90m(Empty AST / No statements parsed)\x1b[0m');
} else {
    for (let i = 0; i < statements.length; i++) {
        console.log(`\x1b[36mStatement ${i + 1} (Pretty Printed):\x1b[0m`);
        console.log(prettyPrinter.visit(statements[i]!));
        console.log(`\n\x1b[36mStatement ${i + 1} (AST Tree):\x1b[0m`);
        
        printTree(statements[i]);
        console.log('\n\x1b[36m---------------------\x1b[0m\n');
    }
}

function printTree(node: any, prefix = '', isRoot = true, isTail = true, key = '') {
    const IGNORED_KEYS = ['debugId', 'startIndex', 'endIndex', 'types', 'type'];
    const keyStr = key ? `\x1b[36m${key}\x1b[0m: ` : '';
    
    let prefixConnector = '';
    let childPrefix = prefix;

    if (!isRoot) {
        const connector = isTail ? '└── ' : '├── ';
        prefixConnector = `\x1b[90m${prefix}${connector}\x1b[0m`;
        childPrefix = prefix + (isTail ? '    ' : '│   ');
    }

    if (node === null || node === undefined) {
        console.log(`${prefixConnector}${keyStr}\x1b[90mnull\x1b[0m`);
        return;
    }

    if (typeof node !== 'object') {
        let valColor = '\x1b[35m'; // magenta for numbers/booleans
        if (typeof node === 'string') valColor = '\x1b[33m'; // yellow for strings
        console.log(`${prefixConnector}${keyStr}${valColor}${node}\x1b[0m`);
        return;
    }

    let nodeTypeName = '';
    if (Array.isArray(node)) {
        nodeTypeName = `\x1b[34m[Array(${node.length})]\x1b[0m`;
    } else if ('type' in node && typeof node.type === 'number') {
        nodeTypeName = `\x1b[32m${YNodeType[node.type] || node.type}\x1b[0m`;
    } else if ('type' in node && typeof node.type === 'string') {
        nodeTypeName = `\x1b[32m${node.type}\x1b[0m`;
    } else {
        nodeTypeName = `\x1b[34mObject\x1b[0m`;
    }

    console.log(`${prefixConnector}${keyStr}${nodeTypeName}`);

    let entries: [string, any][] = [];
    if (Array.isArray(node)) {
        entries = node.map((n, i) => [i.toString(), n]);
    } else {
        entries = Object.entries(node).filter(([k]) => !IGNORED_KEYS.includes(k));
    }

    entries.forEach(([k, v], i) => {
        const isLast = i === entries.length - 1;
        printTree(v, childPrefix, false, isLast, k);
    });
}
