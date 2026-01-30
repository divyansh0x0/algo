export class YError extends Error {
    constructor(message: string) {
        super(message);         // Pass message to the base Error class
        this.name = "YError";  // Set a custom error name

        // Fix prototype chain (necessary for instanceof to work correctly in ES5/ES6)
        Object.setPrototypeOf(this, YError.prototype);
    }
}