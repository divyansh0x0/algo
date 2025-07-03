function createLogContainer(msg: string, type: string): HTMLDivElement {
    const el = document.createElement("div");
    // el.classList.add("logger-out", type);
    switch (type) {
        case "info":
            el.style.backgroundColor = "rgba(0,140,255,0.18)";
            break;
        case "warn":
            el.style.backgroundColor = "rgba(255,241,0,0.18)";
            break;
        case "error":
            el.style.backgroundColor = "rgba(255,0,0,0.18)";
            break;
        case "success":
            el.style.backgroundColor = "rgba(55,255,0,0.18)";
            break;
        default:
            el.style.backgroundColor = "rgba(0,0,0,0.18)";
    }
    Object.assign(el.style, {
        minWidth: "100%",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        width: "fit-content",
        justifyContent: "space-between",
        padding: "0.5em"
    });

    el.innerText = `[${ type }]\t\t\t${ msg }`;
    return el;

}

class ReactiveLogger {
    private readonly value_el: HTMLDivElement;

    constructor(name: string, container: HTMLDivElement) {
        const parent = document.createElement("div");
        const name_el = document.createElement("div");
        name_el.innerText = name;
        this.value_el = document.createElement("div");
        parent.append(name_el, this.value_el);
        // Apply styles
        Object.assign(parent.style, {
            minWidth: "100%",
            display: "flex",
            // border: "1px solid #333",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.04)",
            fontFamily: "sans-serif",
            width: "fit-content",
            justifyContent: "space-between"
        });

        Object.assign(name_el.style, {
            fontWeight: "bold",
            color: "#ececec",
            padding: "0.5em"
        });

        Object.assign(this.value_el.style, {
            color: "#ffffff",
            padding: "0.5em",
            alignContent: "right"
        });

        container.append(parent);
    }

    set(value: string) {
        this.value_el.innerText = value;
    }
}

export class Logger {
    private reactive_logger_map = new Map<string, ReactiveLogger>();
    private readonly container_el: HTMLDivElement;
    private mouse_down_event: undefined | MouseEvent | Touch;
    private readonly reactive_logger_container: HTMLDivElement;

    public constructor(container_el_name: string) {
        this.container_el = document.createElement("div");
        this.reactive_logger_container = document.createElement("div");
        this.container_el.id = container_el_name;
        const name_el = document.createElement("h2");
        name_el.style.textAlign = "center";
        name_el.style.padding = "0.5em";
        name_el.innerText = container_el_name;
        // Apply styles
        Object.assign(this.container_el.style, {
            display: "flex",
            flexDirection: "column",
            width: "max-content",
            minWidth: "200px",
            maxWidth: "100vw",
            padding: "0.5em",
            overflow: "scroll",
            border: "1px solid #333",
            borderRadius: "8px",
            backgroundColor: "#000000",
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.8)",
            fontFamily: "sans-serif",
            maxHeight: "50vh",
            height: "fit-content",
            position: "fixed",
            top: "0",
            left: "50%",
            zIndex: "1000",
            resize: "both",
            scrollingBehavior: "none"
        });

        this.container_el.addEventListener("mousedown", (e) => {
            if ((e.clientY - this.container_el.offsetTop) > 50)
                return;
            this.mouse_down_event = e;
            this.container_el.style.transform = "unset";

        });

        this.container_el.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            if ((touch.clientY - this.container_el.offsetTop) > 50 || !touch)
                return;
            this.mouse_down_event = touch;
            this.container_el.style.transform = "unset";

        });
        window.addEventListener("mousemove", (e) => {
            if (!this.mouse_down_event)
                return;

            this.container_el.style.left = `${ this.container_el.offsetLeft + (e.clientX - this.mouse_down_event.clientX) }px`;
            this.container_el.style.top = `${ this.container_el.offsetTop + (e.clientY - this.mouse_down_event.clientY) }px`;

            this.mouse_down_event = e;
        });
        window.addEventListener("touchmove", (e) => {
            const touch = e.touches[0];
            if (!this.mouse_down_event || !touch)
                return;

            this.container_el.style.left = `${ this.container_el.offsetLeft + (touch.clientX - this.mouse_down_event.clientX) }px`;
            this.container_el.style.top = `${ this.container_el.offsetTop + (touch.clientY - this.mouse_down_event.clientY) }px`;

            this.mouse_down_event = touch;
        });
        this.container_el.addEventListener("mouseup", () => this.mouse_down_event = undefined);
        this.container_el.addEventListener("touchend", () => this.mouse_down_event = undefined);


        document.body.append(this.container_el);
        this.container_el.append(name_el, this.reactive_logger_container);

    }

    public info(msg: string) {
        this.container_el.appendChild(createLogContainer(msg, "info"));
    }

    public warn(msg: string) {
        this.container_el.appendChild(createLogContainer(msg, "warn"));
    }

    public error(msg: string) {
        this.container_el.appendChild(createLogContainer(msg, "error"));
    }

    public getReactiveLog(name: string): ReactiveLogger {
        let logger = this.reactive_logger_map.get(name);
        if (!logger) {
            logger = new ReactiveLogger(name, this.reactive_logger_container);
            this.reactive_logger_map.set(name, logger);
        }
        return logger;
    }

    public success(msg: string) {
        this.container_el.appendChild(createLogContainer(msg, "success"));
    }
}



