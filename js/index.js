import {Scene} from "./engine/scene.mjs";
import {Visualizer} from "./engine/visualizer.mjs";
import {ThemeManager, ThemeType} from "./engine/theme.mjs";
import {graphs} from "./graphs.mjs";

ThemeManager.setThemeType(ThemeType.AUTO);

let is_canvas_visible = true;
const min_screen_width = 740;
const canvas_container = document.getElementById("canvas-container");


const ctx = document.getElementById("main-canvas").getContext("2d", {alpha: false});
const toggle_btn = document.getElementById("toggle-button");
const visualizer_container = document.getElementById("visualizer-container");
const visualizer_data_container = document.getElementById("data-container");
const slider = document.getElementById("slider");
const scene = new Scene(ctx, true);
const algorithm = "DFS Graph Traversal";


function handleToggleBtnVisiblity() {
    toggle_btn.hidden = (window.innerWidth > min_screen_width);
    if (toggle_btn.hidden) {
        //if we don't need toggle button then screen is wide enough
        canvas_container.classList.remove("hidden");
        visualizer_data_container.classList.remove("hidden");
        is_canvas_visible = true;
    } else {
        //if screen is not wide enough then also toggle the hidden class
        visualizer_data_container.style.width = "";
        canvas_container.style.width = "";
        console.log(is_canvas_visible);
        if (!is_canvas_visible && !canvas_container.classList.contains("hidden")) {
            canvas_container.classList.add("hidden");
            visualizer_data_container.classList.remove("hidden");
        } else if (is_canvas_visible && !visualizer_data_container.classList.contains("hidden")) {
            canvas_container.classList.remove("hidden");
            visualizer_data_container.classList.add("hidden");
        }

    }

    is_canvas_visible = !canvas_container.classList.contains("hidden");
    if (is_canvas_visible)
        scene.start();
    else
        scene.stop();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
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
    ctx.resetTransform();
    ctx.scale(ratio, ratio);

    console.debug("Canvas resized:", {
        css: `${rect.width}x${rect.height}`,
        actual: `${ctx.canvas.width}x${ctx.canvas.height}`,
        ratio
    });
}

window.addEventListener("resize", () => {
    handleToggleBtnVisiblity();
    updateCanvasSize(ctx);
});


let is_dragging = false;
slider.addEventListener("mousedown", () => {
    is_dragging = true;
});
window.addEventListener("mouseup", () => {
    is_dragging = false;
    if (resized_canvas) {
        updateCanvasSize(ctx);
        resized_canvas = false;
    }
});
let resize_pending = false;
let resized_canvas = false;
window.addEventListener("mousemove", (e) => {
    if (window.innerWidth < min_screen_width)
        return;

    if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
        const visualizer_rect = visualizer_container.getBoundingClientRect();
        const offsetX = e.pageX;
        const width = offsetX / window.innerWidth * 100;
        canvas_container.style.width = `${offsetX}px`;
        updateCanvasSize(ctx);
        e.preventDefault();
        e.stopImmediatePropagation();
    }
});

toggle_btn.addEventListener("click", () => {
    if (is_canvas_visible) {
        canvas_container.classList.add("hidden");
        visualizer_data_container.classList.remove("hidden");
    } else {
        canvas_container.classList.remove("hidden");
        visualizer_data_container.classList.add("hidden");
    }

    is_canvas_visible = !is_canvas_visible;
    if (is_canvas_visible)
        scene.start();
    else
        scene.stop();
});


document.addEventListener("DOMContentLoaded", () => {

    updateCanvasSize(ctx);
    handleToggleBtnVisiblity();


    const visualizer = new Visualizer(scene, algorithm);
    const drop_down = document.getElementById("config-dropdown");
    for (const graph_name in graphs) {
        const op = document.createElement("option");
        op.innerText = graph_name;
        drop_down.appendChild(op);
    }
    drop_down.value = drop_down.options[1].value;
    visualizer.load(graphs[drop_down.value]);
    drop_down.addEventListener("change", () => visualizer.load(graphs[drop_down.value]));
});