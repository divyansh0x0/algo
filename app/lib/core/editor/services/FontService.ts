export class FontService {
    private span: HTMLSpanElement;
    private charWidth: number = 0;
    private charHeight: number = 0;
    private static testString:string = "ABCDEFGHIZKLMNOPQRSTUVWXYZ";
    constructor(private container:HTMLElement) {
        this.span = document.createElement("span");
        container.appendChild(this.span);

        console.log(container)
        const computedStyles = window.getComputedStyle(container);
        this.span.style.fontFamily = computedStyles.fontFamily;
        this.span.style.fontSize = computedStyles.fontSize;
        this.span.style.fontWeight = computedStyles.fontWeight;
        this.span.style.lineHeight = computedStyles.lineHeight;
        // this.span.style.opacity = "0";
        this.span.style.position = "fixed";
        this.span.style.top = "0px";
        this.span.style.left = "0px";
        this.span.style.padding = "0";
        this.span.style.border = "none";
        this.span.style.margin = "none";

        this.span.innerText = FontService.testString;
    }

    init(){
        console.log(this.span.style.fontFamily);

        this.charWidth = this.span.offsetWidth / FontService.testString.length;
        this.charHeight = this.span.offsetHeight ;

    }

    getCharHeight(): number  {
        console.log(this.charHeight)

        return this.charHeight;
    }

    getCharWidth(): number {
        console.log(this.charWidth)
        return this.charWidth;
    }
}