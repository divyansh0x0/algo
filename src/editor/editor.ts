// const possibleKeywords = ["abstract", "break", "char", "debugger", "double", "export", "finally", "goto", "in",
//     "let", "null", "public", "super", "throw", "try", "volatile", "arguments", "byte", "class", "default", "else",
//     "extends", "float", "if", "instanceof", "long", "package", "return", "switch", "throws", "typeof", "while",
//     "await", "case", "const", "delete", "enum", "false", "for", "implements", "int", "native", "private", "short",
//     "synchronized", "transient", "var", "with", "boolean", "catch", "continue", "do", "eval", "final", "function",
//     "import", "interface", "new", "protected", "static", "this", "true", "void", "yield"];
//
//
// export const reserved = [];
//
//
// for (const word of possibleKeywords) {
//     try {
//         eval(`var ${word} = 1;`);
//     } catch (e) {
//         reserved.push(word);
//     }
// }
// const number_regex = new
// RegExp(/\b(([0-9_]+(\.[0-9_]+)?(e[+-]?[0-9_]+(\.[0-9_]+)?)?)|(0o[0-8_])|(0b[01_])|(0x[a-f0-9_]+))+n?\b/, "gi") const
// escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const keyword_regex = new
// RegExp(`\\b(${reserved.join("|")})\\b`, "g"); // const functionNameRegex =
// /\bfunction\s+([a-zA-Z_$][\w$]*)|\bconst\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:function|\()/g; const function_name_regex =
// new RegExp(/(?<!new\s+)\b(\w+)(?=\(.*?\))/, "gms")  /** * @param {string} code * @returns {string} */ export
// function detectKeywords(code) { // need to remove strings as the content inside strings can interfere with other
// regexes const strings = [] const functions = [] code = code.replace(/(["'])(?:\\.|[^\\])*?\1/g, match => {
// strings.push(match); return `__STRING_PLACEHOLDER_${strings.length - 1}__`; });  code =
// code.replace(function_name_regex, match => { functions.push(match); return
// `__FUNCTION_PLACEHOLDER_${functions.length - 1}__` }) code = code.replace(keyword_regex, "<span class='code-keyword'>$1</span>") code = code.replace(number_regex, "<span class='code-number'>$1</span>") code = code.replace(/__STRING_PLACEHOLDER_(\d+)__/g, (_, index) => { const str = strings[Number(index)]; return `<span class="code-string">${str}</span>`; }); code = code.replace(/__FUNCTION_PLACEHOLDER_(\d+)__/g, (_, index) => { const function_name = functions[Number(index)]; return `<span class='code-function'>${function_name}</span>` }); return code; }
