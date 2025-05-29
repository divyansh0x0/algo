import {Scene} from "./engine/scene.mjs";
import {Visualizer} from "./engine/visualizer.mjs";
import {ThemeManager, ThemeType} from "./engine/theme.mjs";

const min_screen_width = 740;
const canvas_container = document.getElementById("canvas-container");
function updateCanvasSize(ctx) {
    const ratio = window.devicePixelRatio || 1;

    const rect = canvas_container.getBoundingClientRect();

    // Set actual canvas resolution (for drawing)
    ctx.canvas.width = Math.round(rect.width * ratio);
    ctx.canvas.height = Math.round(rect.height * ratio);

    // Set CSS size (display size)
    ctx.canvas.style.width = `${rect.width}px`;
    ctx.canvas.style.height = `${rect.height}px`;

    // Reset and scale the context
    ctx.scale(ratio, ratio);

    console.log("Canvas resized:", {
        css: `${rect.width}x${rect.height}`,
        actual: `${ctx.canvas.width}x${ctx.canvas.height}`,
        ratio
    });
}


ThemeManager.setThemeType(ThemeType.AUTO);

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d", {alpha: false});

updateCanvasSize(ctx);
window.addEventListener("resize", () => {
    updateCanvasSize(ctx);
});

const visualizer_container = document.getElementById("visualizer-container");
const visualizer_data = document.getElementById("visualizer-data");
const slider = document.getElementById("slider");

let is_dragging = false;

slider.addEventListener("mousedown", () => {
    is_dragging = true;
});
window.addEventListener("mouseup", () => {
    is_dragging = false;
});
window.addEventListener("mousemove", (e) => {
    if (window.innerWidth < min_screen_width)
        return;
    if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
        const visualizer_rect = visualizer_container.getBoundingClientRect();
        const offsetX = e.clientX - visualizer_rect.x;
        const width = offsetX / visualizer_rect.width * 100;
        visualizer_data.style.width = `${width}%`;
        canvas_container.style.width = `${100 - width}%`;
        updateCanvasSize(ctx);
        e.preventDefault();
        e.stopImmediatePropagation();
    }
});

// const toggle_btn = document.getElementById()


const scene = new Scene(ctx, true);
const algorithm = "DFS Graph Traversal";
const visualizer = new Visualizer(scene, algorithm);

const default_graph = {
    "A": ["B", "C", "E"],
    "B": ["C"],
    "C": ["A"],
    "D": ["F", "G"],
    "E": ["F", "E", "A"],
    "F": ["D", "E"],
    "G": ["D", "E", "H"],
    "H": ["G", "I", "J", "K", "L", "M"],
    "I": ["H"],
    "J": ["H"],
    "K": ["H"],
    "L": ["H"],
    "M": ["H"]


};
visualizer.start(default_graph, "A");