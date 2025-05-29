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
const big_graph = {
    "1": ["2", "5", "10"],
    "2": ["1", "3", "7"],
    "3": ["2", "4", "8", "12"],
    "4": ["3", "6", "9"],
    "5": ["1", "15", "20"],
    "6": ["4", "11", "13"],
    "7": ["2", "14", "16"],
    "8": ["3", "17", "18"],
    "9": ["4", "19", "21"],
    "10": ["1", "22", "23", "24"],
    "11": ["6", "25", "26"],
    "12": ["3", "27", "28"],
    "13": ["6", "29", "30"],
    "14": ["7", "31", "32", "33"],
    "15": ["5", "34", "35"],
    "16": ["7", "36"],
    "17": ["8", "37", "38"],
    "18": ["8", "39", "40"],
    "19": ["9", "41"],
    "20": ["5", "42", "43"],
    "21": ["9", "44", "45", "46"],
    "22": ["10", "47"],
    "23": ["10", "48"],
    "24": ["10", "49", "50"],
    "25": ["11", "51"],
    "26": ["11", "52", "53"],
    "27": ["12", "54"],
    "28": ["12", "55", "56", "57"],
    "29": ["13", "58"],
    "30": ["13", "59", "60"],
    "31": ["14", "61"],
    "32": ["14", "62"],
    "33": ["14", "63", "64"],
    "34": ["15", "65"],
    "35": ["15", "66", "67", "68"],
    "36": ["16", "69"],
    "37": ["17", "70"],
    "38": ["17", "71", "72"],
    "39": ["18", "73"],
    "40": ["18", "74", "75", "76"],
    "41": ["19", "77"],
    "42": ["20", "78"],
    "43": ["20", "79", "80"],
    "44": ["21", "81"],
    "45": ["21", "82", "83"],
    "46": ["21", "84"],
    "47": ["22", "85", "86", "87"],
    "48": ["23", "88"],
    "49": ["24", "89"],
    "50": ["24", "90", "91"],
    "51": ["25", "92"],
    "52": ["26", "93", "94"],
    "53": ["26", "95"],
    "54": ["27", "96", "97", "98"],
    "55": ["28", "99"],
    "56": ["28", "100"],
    "57": ["28", "1"],
    "58": ["29", "2"],
    "59": ["30", "3", "4"],
    "60": ["30", "5"],
    "61": ["31", "6", "7"],
    "62": ["32", "8"],
    "63": ["33", "9", "10"],
    "64": ["33", "11"],
    "65": ["34", "12", "13", "14"],
    "66": ["35", "15"],
    "67": ["35", "16"],
    "68": ["35", "17", "18"],
    "69": ["36", "19"],
    "70": ["37", "20", "21", "22"],
    "71": ["38", "23"],
    "72": ["38", "24"],
    "73": ["39", "25", "26"],
    "74": ["40", "27"],
    "75": ["40", "28", "29"],
    "76": ["40", "30"],
    "77": ["41", "31", "32", "33", "34"],
    "78": ["42", "35"],
    "79": ["43", "36"],
    "80": ["43", "37", "38"],
    "81": ["44", "39"],
    "82": ["45", "40", "41", "42"],
    "83": ["45", "43"],
    "84": ["46", "44"],
    "85": ["47", "45", "46"],
    "86": ["47", "47"],
    "87": ["47", "48"],
    "88": ["48", "49", "50", "51"],
    "89": ["49", "52"],
    "90": ["50", "53", "54"],
    "91": ["50", "55"],
    "92": ["51", "56", "57", "58"],
    "93": ["52", "59"],
    "94": ["52", "60"],
    "95": ["53", "61", "62"],
    "96": ["54", "63"],
    "97": ["54", "64", "65", "66"],
    "98": ["54", "67"],
    "99": ["55", "68", "69"],
    "100": ["56", "70"]
};
const city_map = {
    "CityA": ["CityB", "CityC"],
    "CityB": ["CityD"],
    "CityC": ["CityE"],
    "CityD": ["CityF"],
    "CityE": ["CityF"],
    "CityF": ["CityG"],
    "CityG": ["CityA"]
};
const supply_chain = {
    "Factory": ["Warehouse1", "Warehouse2"],
    "Warehouse1": ["Retail1", "Retail2"],
    "Warehouse2": ["Retail3"],
    "Retail1": [],
    "Retail2": [],
    "Retail3": [],
    "Supplier": ["Factory"]
};
const course_prerequisites = {
    "Math101": ["Math201"],
    "Math201": ["Math301"],
    "CS101": ["CS201"],
    "CS201": ["CS301"],
    "Math301": ["CS301"],
    "CS301": []
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
    // Initial setup
    updateCanvasSize(ctx);
    handleToggleBtnVisiblity();
    visualizer.start(organization_graph);
    
});