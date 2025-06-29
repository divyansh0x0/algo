import { Vmath } from "@/utils/vmath";

function isValidHexColor(color: string) {
    //adding 1 to 3,4,6,8 valid hex lengths to count for # in the beginning
    return (color.startsWith("#") && (color.length === 4 || (color.length === 5) || (color.length === 7) || (color.length == 9)));
}

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    hex;

    // Overloads
    constructor(hex: string);
    constructor(r: number, g: number, b: number, a?: number);

    // Implementation
    constructor(...args: [ string ] | [ number, number, number, number? ]) {
        if (typeof args[0] === "string") {
            this.hex = args[0];
            const { r, g, b, a } = Color.hexToRgba(this.hex);
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        } else {
            const [ r = 0, g = 0, b = 0, a = 1 ] = args;
            this.r = (r);
            this.g = Vmath.clamp(g, 0, 255);
            this.b = Vmath.clamp(b, 0, 255);
            this.a = Vmath.clamp(a, 0, 255);
            this.hex = Color.getHex(r, g, b, a);
        }
    }

    static hexToRgba(hex: string): { r: number, g: number, b: number, a: number } {
        hex = hex.replace(/^#/, "");

        // Validate hex length
        if (![ 3, 4, 6, 8 ].includes(hex.length)) {
            throw new Error("Invalid hex color code" + hex + ". Must be 3, 4, 6, or 8 digits.");
        }

        // Expand 3 or 4 digit hex to 6 or 8
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split("").map(char => char + char).join("");
        }

        // Parse hex values
        let r, g, b, a = 1;

        if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            a = parseInt(hex.slice(6, 8), 16) / 255;
        }

        // Round alpha to 2 decimal places
        a = Math.round(a * 100) / 100;

        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    }

    static getHex(r: number, g: number, b: number, a?: number): string {
        const rHex = r.toString(16).padStart(2, "0");
        const gHex = g.toString(16).padStart(2, "0");
        const bHex = b.toString(16).padStart(2, "0");
        const aHex = a ? Math.round(a * 255).toString(16).padStart(2, "0") : "";
        return `#${ rHex }${ gHex }${ bHex }${ aHex }`;
    }


    toString(): string {
        if (this.a === 1) {
            return `rgb(${ this.r }, ${ this.g }, ${ this.b })`;
        } else {
            return `rgba(${ this.r }, ${ this.g }, ${ this.b }, ${ this.a.toFixed(2) })`;
        }
    }
}
