import {Scene} from "./engine/scene.mjs";
import {Visualizer} from "./engine/visualizer.mjs";
import {ThemeManager, ThemeType} from "./engine/theme.mjs";

ThemeManager.setThemeType(ThemeType.AUTO);

let is_canvas_visible = true;
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


const ctx = document.getElementById("main-canvas").getContext("2d", {alpha: false});
const toggle_btn = document.getElementById("toggle-button");
const visualizer_container = document.getElementById("visualizer-container");
const visualizer_data_container = document.getElementById("visualizer-data");
const slider = document.getElementById("slider");
const scene = new Scene(ctx, true);
const algorithm = "DFS Graph Traversal";
const visualizer = new Visualizer(scene, algorithm);


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
        console.log(is_canvas_visible)
        if (!is_canvas_visible && !canvas_container.classList.contains("hidden")){
            canvas_container.classList.add("hidden");
            visualizer_data_container.classList.remove("hidden");
        }
        else if(is_canvas_visible && !visualizer_data_container.classList.contains("hidden")){
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
});
window.addEventListener("mousemove", (e) => {
    if (window.innerWidth < min_screen_width)
        return;

    if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
        const visualizer_rect = visualizer_container.getBoundingClientRect();
        const offsetX = e.clientX - visualizer_rect.x;
        const width = offsetX / visualizer_rect.width * 100;
        visualizer_data_container.style.width = `${width}%`;
        canvas_container.style.width = `${100 - width}%`;
        updateCanvasSize(ctx);
        e.preventDefault();
        e.stopImmediatePropagation();
    }
});

toggle_btn.addEventListener("click", () => {
    if(is_canvas_visible){
        canvas_container.classList.add("hidden");
        visualizer_data_container.classList.remove("hidden")
    }
    else{
        canvas_container.classList.remove("hidden");
        visualizer_data_container.classList.add("hidden")
    }

    is_canvas_visible = !is_canvas_visible;
    if (is_canvas_visible)
        scene.start();
    else
        scene.stop();
});

const simple_graph = {
    "A": ["B", "C"],
    "B": ["C"],
    "C": ["D"],
    "D": []
    // "E": ["F"],
    // "F": ["G"],
    // "G": [],
    // "H": ["I"],
    // "I": ["J"],
    // "J": ["K"],
    // "K": ["L"],
    // "L": ["M"],
    // "M": ["N"],
    // "N": [],
};
const default_graph = {
    "A": ["B", "C", "E"],
    "B": ["C", "M", "N", "O"],
    "C": [],
    "D": ["F", "G"],
    "E": ["F", "E", "A"],
    "F": ["E"],
    "G": ["H"],
    "H": ["I", "J", "K", "L", "M"],
    "I": [],
    "J": [],
    "K": [],
    "L": [],
    "M": [],
    "N": [],
    "O": ["P"],
    "P": ["O"]


};
const organization_graph = {
    "CEO": ["CTO", "CFO", "COO"],
    "CTO": ["DevManager", "QALead"],
    "CFO": ["Accountant1", "Accountant2"],
    "COO": ["HRManager", "OperationsHead"],
    "DevManager": ["Dev1", "Dev2", "Dev3", "Dev4", "Dev5", "Dev6"],
    "QALead": ["QA1", "QA2", "QA3", "QA4", "QA5", "QA6"],
    "HRManager": ["Recruiter1", "Recruiter2"],
    "OperationsHead": ["Logistics1", "Logistics2"],
    "Dev1": [],
    "Dev2": [],
    "Dev3": [],
    "Dev4": [],
    "Dev5": [],
    "Dev6": [],
    "QA1": [],
    "QA2": [],
    "QA3": [],
    "QA4": [],
    "QA5": [],
    "QA6": [],
    "Accountant1": [],
    "Accountant2": [],
    "Recruiter1": [],
    "Recruiter2": [],
    "Logistics1": [],
    "Logistics2": []
};

const clustered_graph = {
    // Cluster 1 (around C1)
    "C1": ["C1-1", "C1-2", "C1-3", "C1-4", "C1-5", "C1-6", "C1-7", "C1-8", "C1-9", "C1-10", "C2", "C3", "C4"],
    "C1-1": ["C1", "C1-2"],
    "C1-2": ["C1-3", "C1-4"],
    "C1-3": ["C1-5"],
    "C1-4": ["C1-6"],
    "C1-5": [],
    "C1-6": ["C1-7"],
    "C1-7": [],
    "C1-8": ["C1-9"],
    "C1-9": ["C1-10"],
    "C1-10": [],

    // Cluster 2 (around C2)
    "C2": ["C2-1", "C2-2", "C2-3", "C2-4", "C2-5", "C2-6", "C2-7", "C2-8", "C2-9", "C2-10", "C2-11"],
    "C2-1": [],
    "C2-2": [],
    "C2-3": [],
    "C2-4": [],
    "C2-5": [],
    "C2-6": [],
    "C2-7": [],
    "C2-8": [],
    "C2-9": [],
    "C2-10": [],
    "C2-11": [],

    // Cluster 3 (around C3)
    "C3": ["C3-1", "C3-2", "C3-3", "C3-4", "C3-5", "C3-6", "C3-7", "C3-8", "C3-9", "C3-10", "C3-11", "C3-12"],
    "C3-1": [],
    "C3-2": [],
    "C3-3": [],
    "C3-4": ["C3-5"],
    "C3-5": ["C3-6"],
    "C3-6": [],
    "C3-7": [],
    "C3-8": [],
    "C3-9": ["C3-10"],
    "C3-10": ["C3-11"],
    "C3-11": ["C3-12"],
    "C3-12": [],

    // Cluster 4 (around C4)
    "C4": ["C4-1", "C4-2", "C4-3", "C4-4", "C4-5", "C4-6", "C4-7", "C4-8", "C4-9", "C4-10"],
    "C4-1": ["C4", "C4-2"],
    "C4-2": ["C4-3"],
    "C4-3": [],
    "C4-4": [],
    "C4-5": [],
    "C4-6": ["C4-7"],
    "C4-7": ["C4-8"],
    "C4-8": [],
    "C4-9": ["C4-10"],
    "C4-10": []

};


document.addEventListener("DOMContentLoaded", () => {
    updateCanvasSize(ctx);
    handleToggleBtnVisiblity();
    visualizer.start(clustered_graph);
    
});