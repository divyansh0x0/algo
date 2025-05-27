import {getAlgorithm} from "./algorithms/Algorithms.mjs";
import {Scene} from "./engine/scene.mjs";
import {Visualizer} from "./engine/visualizer.mjs";
import {ThemeManager, ThemeType} from "./engine/theme.mjs";


function updateCanvasSize(ctx) {
    const ratio = window.devicePixelRatio;
    const rect = ctx.canvas.getBoundingClientRect();
    console.log(ctx.canvas.style.width);
    ctx.canvas.width = Math.round(rect.width * ratio);
    ctx.canvas.height = Math.round(rect.height * ratio);

    ctx.scale(ratio, ratio);

}

ThemeManager.setThemeType(ThemeType.AUTO);

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d", {alpha: false});

updateCanvasSize(ctx);
window.addEventListener("resize", () => {
    updateCanvasSize(ctx);
});

const scene = new Scene(ctx, true);
const algorithm = "DFS Graph Traversal";
const visualizer = new Visualizer(scene, algorithm);
;
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