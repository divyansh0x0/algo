"use strict";

import { YASLRepl } from "@/editor/repl";
import { Scene, SceneLogger } from "@/engine/scene";
import { ThemeManager, ThemeType } from "@/engine/theme";
import { Visualizer } from "@/engine/visualizer";
import { clustered_graph, large_graph, simple_graph, spider_web_graph } from "@/graph";
import { Settings } from "@/settings";

const FULLSCREEN_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M5 19h2q.425 0 .713.288T8 20t-.288.713T7 21H4q-.425 0-.712-.288T3 20v-3q0-.425.288-.712T4 16t.713.288T5 17zm14 0v-2q0-.425.288-.712T20 16t.713.288T21 17v3q0 .425-.288.713T20 21h-3q-.425 0-.712-.288T16 20t.288-.712T17 19zM5 5v2q0 .425-.288.713T4 8t-.712-.288T3 7V4q0-.425.288-.712T4 3h3q.425 0 .713.288T8 4t-.288.713T7 5zm14 0h-2q-.425 0-.712-.288T16 4t.288-.712T17 3h3q.425 0 .713.288T21 4v3q0 .425-.288.713T20 8t-.712-.288T19 7z\"/></svg>";
const EXIT_FULLSCREEN_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M6 18H4q-.425 0-.712-.288T3 17t.288-.712T4 16h3q.425 0 .713.288T8 17v3q0 .425-.288.713T7 21t-.712-.288T6 20zm12 0v2q0 .425-.288.713T17 21t-.712-.288T16 20v-3q0-.425.288-.712T17 16h3q.425 0 .713.288T21 17t-.288.713T20 18zM6 6V4q0-.425.288-.712T7 3t.713.288T8 4v3q0 .425-.288.713T7 8H4q-.425 0-.712-.288T3 7t.288-.712T4 6zm12 0h2q.425 0 .713.288T21 7t-.288.713T20 8h-3q-.425 0-.712-.288T16 7V4q0-.425.288-.712T17 3t.713.288T18 4z\"/></svg>";


document.addEventListener("DOMContentLoaded", () => {


    let is_canvas_visible = true;
    const canvas_container = document.getElementById("canvas-container");

    const main_canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const ctx = main_canvas.getContext("2d", { alpha: false });
    if (!main_canvas) {
        //console.log("Main canvas is undefined");
        return;
    }
    if (!ctx) {
        //console.log("Context is undefined");
        return;
    }
    const toggle_btn = document.getElementById("toggle-btn");
    const visualizer_data_container = document.getElementById("data-container");
    const slider = document.getElementById("slider");
    const scene = new Scene(ctx, true);
    const algorithm = "DFS Graph Traversal";


    function validateContainerVisibility() {
        const is_wide = window.innerWidth > Settings.MIN_SCREEN_WIDTH;

        if (is_wide) {
            // Large screen: show both
            canvas_container?.classList.remove("hidden");
            visualizer_data_container?.classList.remove("hidden");
            is_canvas_visible = true;
        } else {
            if (!is_canvas_visible) {
                canvas_container?.classList.add("hidden");
                visualizer_data_container?.classList.remove("hidden");
                is_canvas_visible = false;
            } else {
                canvas_container?.classList.remove("hidden");
                visualizer_data_container?.classList.add("hidden");
                is_canvas_visible = true;
            }

        }
        if (window.innerWidth <= Settings.MIN_SCREEN_WIDTH) {
            if (is_canvas_visible)
                scene.start();
            else
                scene.stop();
        }

    }

    (function enableFullscreenLogic() {
        const fullscreen_btn = document.getElementById("fullscreen-btn")!;
        let is_fullscreen = false;
        fullscreen_btn?.addEventListener("click", () => {
            is_fullscreen = document.fullscreenElement !== null;
            if (!is_fullscreen)
                document.body.requestFullscreen().then(() => {
                    fullscreen_btn.innerHTML = EXIT_FULLSCREEN_ICON_SVG;
                    is_fullscreen = true;
                });
            else
                document.exitFullscreen().then(() => {
                    fullscreen_btn.innerHTML = FULLSCREEN_ICON_SVG;
                    is_fullscreen = false;
                });
        });
        document.body.addEventListener("fullscreenchange", (e) => {
            is_fullscreen = document.fullscreenElement !== null;
            fullscreen_btn.innerHTML = is_fullscreen ? EXIT_FULLSCREEN_ICON_SVG : FULLSCREEN_ICON_SVG;
        });
    })();

    function updateCanvasSize(ctx: CanvasRenderingContext2D) {
        if (!canvas_container)
            return;
        const ratio = window.devicePixelRatio || 1;

        const rect = canvas_container.getBoundingClientRect();


        const prev_transform = ctx.getTransform();
        // Set actual canvas resolution (for drawing)
        ctx.canvas.width = Math.round(rect.width * ratio);
        ctx.canvas.height = Math.round(rect.height * ratio);

        ctx.setTransform(prev_transform);
        // // Set CSS size (display size)
        // ctx.canvas.style.width = `${ rect.width }px`;
        // ctx.canvas.style.height = `${ rect.height }px`;

        SceneLogger.getReactiveLog("CanvasSize").set(`${ ctx.canvas.offsetWidth }x${ ctx.canvas.offsetHeight }`);
        SceneLogger.getReactiveLog("CanvasContainerSize").set(`${ canvas_container.offsetWidth }x${ canvas_container.offsetHeight }`);

        //rerender the frame
        scene.render();

    }

    window.addEventListener("resize", () => {
        canvas_container!.style.width = "";
        validateContainerVisibility();
        updateCanvasSize(ctx);
    });
    window.addEventListener("orientationchange", () => {
        canvas_container!.style.width = "";
        validateContainerVisibility();
        updateCanvasSize(ctx);
    });
    let is_dragging = false;
    slider?.addEventListener("mousedown", () => {
        document.body.style.cursor = "ew-resize";
        is_dragging = true;
    });
    slider?.addEventListener("touchstart", () => {
        is_dragging = true;
    });

    window.addEventListener("mouseup", () => {
        is_dragging = false;

        document.body.style.cursor = "default";
        updateCanvasSize(ctx);
    });
    window.addEventListener("touchend", () => {
        is_dragging = false;
        updateCanvasSize(ctx);
    });
    window.addEventListener("mousemove", (e) => {
        if (!canvas_container)
            return;
        if (window.innerWidth <= Settings.MIN_SCREEN_WIDTH)
            return;

        if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
            const offsetX = e.pageX;
            canvas_container.style.width = `${ offsetX }px`;
            updateCanvasSize(ctx);
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });
    window.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        if (!canvas_container)
            return;
        if (window.innerWidth <= Settings.MIN_SCREEN_WIDTH)
            return;

        if (is_dragging && touch.clientX < window.innerWidth && touch.clientX > 0) {
            const offsetX = touch.pageX;
            canvas_container.style.width = `${ offsetX }px`;
            updateCanvasSize(ctx);
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });

    toggle_btn?.addEventListener("click", () => {
        if (is_canvas_visible) {
            canvas_container?.classList.add("hidden");
            visualizer_data_container?.classList.remove("hidden");
        } else {
            canvas_container?.classList.remove("hidden");
            visualizer_data_container?.classList.add("hidden");
        }

        is_canvas_visible = !is_canvas_visible;
        if (is_canvas_visible)
            scene.start();
        else
            scene.stop();
    });


    ThemeManager.setThemeType(ThemeType.AUTO);

    if (canvas_container && slider && window.innerWidth > Settings.MIN_SCREEN_WIDTH)
        canvas_container.style.width = `${ slider.getBoundingClientRect().x }px`;


    updateCanvasSize(ctx);
    validateContainerVisibility();
    const visualizer = new Visualizer(scene, algorithm);

    const drop_down = document.getElementById("config-dropdown") as HTMLSelectElement;
    if (drop_down) {
        const graphs = {
            "simple": simple_graph,
            "clustered small": clustered_graph,
            "spider web": spider_web_graph,
            "large clustered": large_graph
        };
        for (const graph_name in graphs) {
            const op: HTMLOptionElement = document.createElement("option");
            op.innerText = graph_name;
            drop_down.appendChild(op);
        }
        drop_down.value = drop_down.options[3].value;
        visualizer.load(graphs[drop_down.value as keyof typeof graphs]);

        drop_down.addEventListener("change", () => {
            visualizer.load(graphs[drop_down.value as keyof typeof graphs]);
            console.log("changing");
        });


        attachInterpreter();
    }
});

function attachInterpreter() {
    const yasl_input = document.getElementById("yasl-repl")!;
    new YASLRepl(yasl_input);
    // yasl_input.addEventListener("keyup",(e)=>{
    //     if(e.key === "Enter" || e.key === "enter"){
    //         const code = yasl_input.value;
    //         yasl_input.value = "";
    //         parseCode(code)
    //     }
    // })
    // runtime.run()
}
