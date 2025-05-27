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
    if (is_dragging) {
        visualizer_data.width = e.clientX;
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
    "A": ["B", "C", "D"],
    "B": ["C", "F", "G"],
    "C": ["A"],
    "D": ["A"],
    "E": ["F","E"],
    "F": ["B", "E"],
    "G": ["B", "E", "H"],
    "H": ["G","I", "J"],
    "I": ["H"],
    "J": ["H"],
    // "K": ["F"],
    // "L": ["D"],
    // "M": ["C"]


};
visualizer.start(default_graph, "A");