import { getAlgorithm } from "./algorithms/Algorithms.mjs";
import { Scene } from "./engine/scene.mjs";
import { Visualizer } from "./engine/visualizer.mjs";

function updateCanvasSize(ctx) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

}


const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

updateCanvasSize(ctx);
window.addEventListener('resize', ()=>{updateCanvasSize (ctx )});

const scene  = new Scene(ctx, true);
const algorithm = getAlgorithm("DFS");
const visualizer = new Visualizer(scene, algorithm); ;
visualizer.start();