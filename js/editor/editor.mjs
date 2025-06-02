const possibleKeywords = ["abstract", "break", "char", "debugger", "double", "export", "finally", "goto", "in",
    "let", "null", "public", "super", "throw", "try", "volatile", "arguments", "byte", "class", "default", "else",
    "extends", "float", "if", "instanceof", "long", "package", "return", "switch", "throws", "typeof", "while",
    "await", "case", "const", "delete", "enum", "false", "for", "implements", "int", "native", "private", "short",
    "synchronized", "transient", "var", "with", "boolean", "catch", "continue", "do", "eval", "final", "function",
    "import", "interface", "new", "protected", "static", "this", "true", "void", "yield"];


export const reserved = [];

for (const word of possibleKeywords) {
    try {
        new Function(`var ${word} = 1;`);
    } catch (e) {
        reserved.push(word);
    }
}


const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keyword_regex = new RegExp(`\\b(${reserved.join("|")})\\b`, "g");

/**
 * @param {string} code
 * @returns {string}
 */
export function detectKeywords(code) {
    // Step 1: Temporarily extract strings
    const strings = [];
    code = code.replace(/(["'])(?:\\.|[^\\])*?\1/g, match => {
        strings.push(match);
        return `__STRING_PLACEHOLDER_${strings.length - 1}__`;
    });

    // Step 2: Highlight keywords
    code = code.replace(keyword_regex, "<span class='code-keyword'>$1</span>");

    // Step 3: Restore strings with highlighting
    code = code.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (_, index) => {
        const str = strings[Number(index)];
        return `<span class="code-string">${str}</span>`;
    });

    return code;
}