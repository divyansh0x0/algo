export class StringUtils {
    static countLeadingWhitespaces(str: string) {
        let i = 0;
        while (i < str.length && /\s/.test(str[i])) i++;
        return i;
    }

    static countTrailingWhitespaces(str: string) {
        let i = str.length - 1;
        while (i >= 0 && /\s/.test(str[i])) i--;
        return str.length - 1 - i;

    }

    static isWhitespace(raw: string): boolean {
        for (let i = 0; i < raw.length; i++) {
            switch (raw[i]) {
                case " ":
                case "\t":
                case "\n":
                case "\r":
                    break;
                default:
                    return false;
            }
        }
        return true;
    }
}
