export class Logger {
    static INFO = 0;
    static WARN = 1;
    static ERROR = 2;
    static SUCCESS = 3;
    static LOG_COLORS = {
        0: "#5b88fa",
        1: "#e4bb16",
        2: "#fd6e6e",
        3: "#70ff70"
    };

    /**
     *
     * @param ctx canvas context 2d
     * @param available_area An array of format [x,y,width,height] which defines the available area for logs
     */
    constructor() {
        this.storage_map = new Map();
        this.border_radius = [10, 10, 10, 10];
        this.color = "#000";
        this.text_color = "#fff";
    }

    log(msg, type, duration_ms = 1000) {
        const key = performance.now().toFixed(0);
        const log_data = {msg: msg, type: type};
        this.storage_map.set(key, log_data);

        if (!isNaN(duration_ms)) {
            setTimeout(() => {
                this.storage_map.delete(key);
            }, duration_ms);
        }
    }

    getLogSuffix(type) {
        switch (type) {
            case 0:
                return "INFO";
            case 1:
                return "WARN";
            case 2:
                return "ERROR";
            case 3:
                return "SUCCESS";

        }
    }
}