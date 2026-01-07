export class YASLError extends Error {
    constructor(message: string) {
        super(message);         // Pass message to the base Error class
        this.name = "YASLError";  // Set a custom error name

        // Fix prototype chain (necessary for instanceof to work correctly in ES5/ES6)
        Object.setPrototypeOf(this, YASLError.prototype);
    }
}