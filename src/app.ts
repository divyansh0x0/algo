"use strict";

import { Scene, SceneLogger } from "@/engine/scene";
import { ThemeManager, ThemeType } from "@/engine/theme";
import { Visualizer } from "@/engine/visualizer";
import { clustered_graph, large_graph, simple_graph, spider_web_graph } from "@/graph";


document.addEventListener("DOMContentLoaded", () => {

    let is_canvas_visible = false;
    const min_screen_width = 740;
    const canvas_container = document.getElementById("canvas-container");

    const main_canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const ctx = main_canvas.getContext("2d", { alpha: false });
    if (!main_canvas) {
        console.log("Main canvas is undefined");
        return;
    }
    if (!ctx) {
        console.log("Context is undefined");
        return;
    }
    const toggle_btn = document.getElementById("toggle-button");
    // const visualizer_container = document.getElementById("visualizer-container");
    const visualizer_data_container = document.getElementById("data-container");
    const slider = document.getElementById("slider");
    const scene = new Scene(ctx, true);
    const algorithm = "DFS Graph Traversal";


    function handleToggleBtnVisibility() {
        if (!toggle_btn || !canvas_container || !visualizer_data_container)
            return;

        const is_wide = window.innerWidth > min_screen_width;

        toggle_btn.hidden = is_wide;

        if (is_wide) {
            // Large screen: show both
            canvas_container.classList.remove("hidden");
            visualizer_data_container.classList.remove("hidden");
            is_canvas_visible = true;
        } else {
            // Small screen: show canvas only by default
            canvas_container.classList.remove("hidden");
            visualizer_data_container.classList.add("hidden");
            is_canvas_visible = true;
        }

        if (is_canvas_visible)
            scene.start();
        else
            scene.stop();
    }


    function updateCanvasSize(ctx: CanvasRenderingContext2D) {
        if (!canvas_container)
            return;
        const ratio = window.devicePixelRatio || 1;

        const rect = canvas_container.getBoundingClientRect();

        // Set actual canvas resolution (for drawing)
        ctx.canvas.width = Math.round(rect.width * ratio);
        ctx.canvas.height = Math.round(rect.height * ratio);

        // Set CSS size (display size)
        ctx.canvas.style.width = `${ rect.width }px`;
        ctx.canvas.style.height = `${ rect.height }px`;

        // Reset and scale the context
        ctx.resetTransform();
        ctx.scale(ratio, ratio);

        console.debug("Canvas resized:", {
            css: `${ rect.width }x${ rect.height }`,
            actual: `${ ctx.canvas.width }x${ ctx.canvas.height }`,
            ratio
        });
    }

    window.addEventListener("resize", () => {
        handleToggleBtnVisibility();
        updateCanvasSize(ctx);
    });


    let is_dragging = false;

    slider?.addEventListener("mousedown", () => {
        document.body.style.cursor = "ew-resize";
        is_dragging = true;
    });

    window.addEventListener("mouseup", () => {
        is_dragging = false;

        document.body.style.cursor = "default";
        updateCanvasSize(ctx);
        resized_canvas = false;
    });
    let resized_canvas = false;
    window.addEventListener("mousemove", (e) => {
        if (!canvas_container)
            return;
        if (window.innerWidth <= min_screen_width)
            return;

        if (is_dragging && e.clientX < window.innerWidth && e.clientX > 0) {
            const offsetX = e.pageX;
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

    if (canvas_container && slider && window.innerWidth > min_screen_width)
        canvas_container.style.width = `${ slider.getBoundingClientRect().x }px`;


    updateCanvasSize(ctx);
    handleToggleBtnVisibility();
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
        drop_down.value = drop_down.options[1].value;
        visualizer.load(graphs[drop_down.value as keyof typeof graphs]);

        drop_down.addEventListener("change", () => {
            visualizer.load(graphs[drop_down.value as keyof typeof graphs]);
            console.log("changing");
        });
    }

    /**
     * FULLSCREEN LOGIC
     * */
    SceneLogger.info("Loaded");
    const doc_el = document.documentElement;
    // doc_el.requestFullscreen({ navigationUI: "hide" }).then(r  => SceneLogger.success("Browser nav bar hidden"));
});
