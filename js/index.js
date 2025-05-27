import {Scene} from "./engine/scene.mjs";
import {Visualizer} from "./engine/visualizer.mjs";
import {ThemeManager, ThemeType} from "./engine/theme.mjs";


function updateCanvasSize(ctx) {
    const ratio = window.devicePixelRatio;
    const rect = ctx.canvas.getBoundingClientRect();
    console.log(ctx.canvas.style.width);
    ctx.canvas.width = Math.round(rect.width * ratio);
    ctx.canvas.height = Math.round(rect.height * ratio);

    console.log(rect.width);
    ctx.scale(ratio, ratio);

}


ThemeManager.setThemeType(ThemeType.AUTO);

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d", {alpha: false});

updateCanvasSize(ctx);
window.addEventListener("resize", () => {
    updateCanvasSize(ctx);
});
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
    if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
        visualizer_data.style.width = e.clientX + "px";
        canvas.width = window.innerWidth - e.clientX;
        updateCanvasSize(ctx);
        e.preventDefault();
        e.stopImmediatePropagation();
    }
});


const scene = new Scene(ctx, true);
const algorithm = "DFS Graph Traversal";
const visualizer = new Visualizer(scene, algorithm);

const default_graph = {
    "A": ["B", "C"],
    "B": ["C"],
    "C": ["A"],
    // "D": ["F", "G"],
    // "E": ["F","E"],
    // "F": ["D", "E"],
    // "G": ["D", "E", "H"],
    // "H": ["G","I", "J"],
    // "I": ["H"],
    // "J": ["H"],
    // "K": ["F"],
    // "L": ["D"],
    // "M": ["C"]


};
visualizer.start(default_graph, "A");