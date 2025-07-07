import { Animator, EasingFunctions, ValueAnimation } from "@/engine/animation";
import { Drawable } from "@/engine/components/drawable";
import { Edge } from "@/engine/components/edge";
import { Logger } from "@/engine/components/logger";
import { Node } from "@/engine/components/node";
import { ThemeManager } from "@/engine/theme";
import { Size, Vector } from "@/utils/geometry";
import { Mouse } from "@/utils/mouse";
import { AABB, ForceQuadTree, QuadTreeNode } from "@/utils/quadtree";
import { Vmath } from "@/utils/vmath";

const ZERO_VEC = Object.freeze({ x: 0, y: 0 });
const PAUSE_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M14 19V5h4v14zm-8 0V5h4v14z\"/></svg>";
const PLAY_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712\"/></svg>";
export const SceneLogger = new Logger("scene-logger");

class Throttle {
    private lastCall = 0;

    constructor(private func: (...args: any[]) => any, private wait_ms: number) {}

    call(...args: any[]) {
        const now = Date.now();
        if (now - this.lastCall >= this.wait_ms) {
            this.lastCall = now;
            this.func(...args);
        }
    }
}

function getTouchById(touchList: TouchList, id: number): Touch | null {
    for (const touch of touchList) {
        if (touch.identifier === id)
            return touch;
    }
    return null;
}

export class Scene {
    static ZOOM_DELTA = 0.1;
    static MIN_ZOOM = 0.1;
    static MAX_ZOOM = 10;
    readonly animator = new Animator();
    private camera = {
        x: 0,
        y: 0,
        zoom: 1
    };

    private nodes: Map<string, Node> = new Map;
    private edges: Map<string, Edge> = new Map;
    private accumulated_alpha: number = -1;
    private accumulated_frame_time = 0;
    private accumulated_node_position_change: number = -1;
    private fps = 0;
    private last_animation_call_time = 0;
    private drawable_selected: null | Drawable = null;
    private grid_size: Size = new Size(100, 100);
    private prev_mouse_pos: Vector = new Vector();

    private is_running: boolean;
    private debug_box_el: HTMLInputElement | null;
    private force_quad_tree: undefined | ForceQuadTree;
    private fps_counter: number = 0;
    private bounds: DOMRect | undefined;
    private offset: Vector = new Vector(0);
    private debounceSelectedNodeAlphaReset: Throttle;
    private debounceCanvasResizeNodeAlphaReset: Throttle;

    private readonly mouse_info: Mouse;
    private readonly start_btn: HTMLButtonElement;
    private dragging_camera: boolean = false;
    private is_zooming: boolean = false;

    private initial_touches: TouchList | null = null;
    private pinching_to_zoom: boolean = false;

    constructor(public ctx: CanvasRenderingContext2D, private readonly show_fps: boolean = false) {
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.show_fps = show_fps;
        this.is_running = false;
        this.debug_box_el = document.getElementById("debug-box") as HTMLInputElement;

        this.mouse_info = new Mouse(this.ctx.canvas);


        this.debounceSelectedNodeAlphaReset = new Throttle(() => {
            const increment_alpha = () => {
                let increased_alpha = false;
                if (!this.drawable_selected)
                    return;
                for (const quad_node of this.force_quad_tree!.getNodesInCircularRange(this.drawable_selected.pos, 300)) {
                    const node = this.nodes.get(quad_node.id);
                    if (!node)
                        continue;
                    if (node.alpha === 0)
                        node.alpha += 0.1;
                    if (node.alpha < 0.5) {
                        node.alpha += Node.alphaDecay;
                        increased_alpha = true;
                    }

                }
                if (increased_alpha)
                    frame_id = requestAnimationFrame(increment_alpha);
                else cancelAnimationFrame(frame_id);

            };

            let frame_id = requestAnimationFrame(increment_alpha);
        }, 4000);
        this.debounceCanvasResizeNodeAlphaReset = new Throttle(() => {
            const increment_alpha = () => {
                let increased_alpha = false;
                for (const [ , node ] of this.nodes) {

                    if (node.alpha < 0.5) {
                        node.alpha += Node.alphaDecay;
                        increased_alpha = true;
                    }
                }
                if (increased_alpha)
                    frame_id = requestAnimationFrame(increment_alpha);
                else cancelAnimationFrame(frame_id);

            };

            let frame_id = requestAnimationFrame(increment_alpha);


        }, 5000);

        const resize_observer = new ResizeObserver(() => {
            this.debounceCanvasResizeNodeAlphaReset.call();
        });
        resize_observer.observe(this.ctx.canvas);

        this.start_btn = document.getElementById("start-btn") as HTMLButtonElement;
        if (this.start_btn) {
            this.start_btn.addEventListener("click", () => {
                if (this.is_running)
                    this.stop();
                else
                    this.start();


            });
        }


        this.ctx.canvas.addEventListener("mousedown", (e) => this.handleMousePressed(e));
        this.ctx.canvas.addEventListener("touchstart", (e) => {

            this.initial_touches = e.touches;
            //treat single touch as mouse touch
            if (e.touches.length === 1)
                this.handleMousePressed(e);
            else
                this.handleMultiTouch(e);

        });
        this.ctx.canvas.addEventListener("wheel", (e) => {
            this.zoomAt(e.clientX * devicePixelRatio, e.clientY * devicePixelRatio, e.deltaY < 0);
        });
        window.addEventListener("mouseup", () => this.handleMouseUp());
        window.addEventListener("touchend", () => {
            this.handleMouseUp();
            this.pinching_to_zoom = false;
        });
        window.addEventListener("mousemove", (e) => this.handleMouseMove(e));
        window.addEventListener("touchmove", (e) => {
            SceneLogger.getReactiveLog("Touch count").set(e.touches[0].identifier.toString());
            if (e.touches.length === 1)
                this.handleMouseMove(e);
            else
                this.handleMultiTouchMove(e);
        });
    }

    getTransformedPoint(screenX: number, screenY: number): Vector {
        return new Vector(
            screenX / (this.camera.zoom * devicePixelRatio) + this.camera.x,
            screenY / (this.camera.zoom * devicePixelRatio) + this.camera.y
        );
    }

    render() {
        const dpr = devicePixelRatio || 1;
        this.ctx.setTransform(
            dpr * this.camera.zoom, 0,
            0, dpr * this.camera.zoom,
            -this.camera.x * dpr * this.camera.zoom,
            -this.camera.y * dpr * this.camera.zoom
        );


        const canvas_width = this.ctx.canvas.width;
        const canvas_height = this.ctx.canvas.height;
        //Background of canvas
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.fillStyle = ThemeManager.getBgColor("canvas").hex;
        this.ctx.fillRect(0, 0, canvas_width, canvas_height);

        this.ctx.beginPath();

        const startX = -((this.camera.x * this.camera.zoom * dpr) % (this.grid_size.width * this.camera.zoom * dpr));
        const startY = -((this.camera.y * this.camera.zoom * dpr) % (this.grid_size.height * this.camera.zoom * dpr));
        //Gridlines
        this.ctx.strokeStyle = ThemeManager.getColor("grid").hex;
        this.ctx.lineWidth = 1;

        for (let x = startX; x < canvas_width; x += this.grid_size.width * this.camera.zoom * dpr) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvas_height);
        }
        for (let y = startY; y < canvas_height; y += this.grid_size.height * this.camera.zoom * dpr) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(canvas_width, y);
        }
        this.ctx.stroke();
        this.ctx.restore();


        this.ctx.save();
        //Drawing drawables
        const edges = this.edges;
        const nodes = this.nodes;
        for (const [ , edge ] of edges) {
            edge.render();

        }


        for (const [ , node ] of nodes) {
            if (!node)
                continue;
            node.render();

        }


        //Quad tree debug
        if (this.force_quad_tree && this.debug_box_el?.checked) {
            this.ctx.beginPath();
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = ThemeManager.getColor("debug").hex;

            let b = null;
            for (const region of this.force_quad_tree.getAllRegions()) {
                b = region.boundary;

                this.ctx.strokeRect(b.center.x - b.half_dimension.width, b.center.y - b.half_dimension.height, b.half_dimension.width * 2, b.half_dimension.height * 2);
                if (region.COM)
                    this.ctx.fillText(`${ region.mass }`, region.COM.x, region.COM.y);
            }
            // if(!this.mark)
            //     this.mark = true;

            this.ctx.closePath();


        }
        this.ctx.restore();
    }

    async loop(curr_animation_call_time: number) {
        if (!this.is_running)
            return;
        const t1 = this.last_animation_call_time;
        const dt_ms = curr_animation_call_time - this.last_animation_call_time;
        this.last_animation_call_time = curr_animation_call_time;


        this.update(dt_ms);
        this.render();

        const frame_time = curr_animation_call_time - t1;


        this.accumulated_frame_time += frame_time;
        if (this.show_fps) {
            if (this.accumulated_frame_time >= 1000) {
                this.accumulated_frame_time = 0;
                this.fps = this.fps_counter;
                this.fps_counter = 0;
            } else
                this.fps_counter += 1;
        }
        requestAnimationFrame((time) => {
            this.loop(time);
        });
    }

    start() {
        if (this.is_running)
            return;
        this.is_running = true;
        this.last_animation_call_time = performance.now();

        // this.prev_mouse_pos = this.mouse_info.location;
        this.loop(this.last_animation_call_time);
        this.start_btn.innerHTML = PAUSE_ICON_SVG;
    }

    // private getScaledEventLocation(e: MouseEvent | TouchEvent, touch_index = 0): [ number, number ] {
    // return [  ];
    // }

    stop() {
        this.render();

        this.is_running = false;
        this.accumulated_frame_time = 0;
        this.fps = 0;
        this.fps_counter = 0;
        this.start_btn.innerHTML = PLAY_ICON_SVG;
    }

    update(dt_ms: number) {
        SceneLogger.getReactiveLog("FPS").set(this.fps.toString());
        SceneLogger.getReactiveLog("ZOOM").set(this.camera.zoom.toString());
        SceneLogger.getReactiveLog("Prev Mouse Loc").set(`${ this.prev_mouse_pos.x }i + ${ this.prev_mouse_pos.y }j`);
        SceneLogger.getReactiveLog("Camera").set(`${ this.camera.x }i + ${ this.camera.y }j`);
        SceneLogger.getReactiveLog("Accumulated position change").set(this.accumulated_node_position_change.toString());
        SceneLogger.getReactiveLog("OFFSET").set(`x: ${ Vmath.round(this.offset.x, 2) }, y: ${ Vmath.round(this.offset.y, 2) }`);
        SceneLogger.getReactiveLog("Nodes").set(this.nodes.size.toString());
        SceneLogger.getReactiveLog("Edges").set(this.edges.size.toString());
        SceneLogger.getReactiveLog("DPR").set(devicePixelRatio.toString());

        const canvas_width = this.ctx.canvas.width;
        const canvas_height = this.ctx.canvas.height;
        SceneLogger.getReactiveLog("Bounds").set(`${ Vmath.round(canvas_width, 2) }x${ Vmath.round(canvas_height, 2) }`);

        if (this.accumulated_node_position_change !== 0) {
            const topLeft = this.getTransformedPoint(0, 0);
            const bottomRight = this.getTransformedPoint(canvas_width, canvas_height);

            const width = bottomRight.x - topLeft.x;
            const height = bottomRight.y - topLeft.y;
            const padding = 300;
            this.force_quad_tree = new ForceQuadTree(AABB.fromRect(topLeft.x - padding, topLeft.y - padding, width + 2 * padding, height + 2 * padding));

            //Building QUADTREE
            for (const [ , node ] of this.nodes) {
                this.force_quad_tree.insert(node.quad_tree_node);
            }
            SceneLogger.getReactiveLog("Building quadtree").set("True");
        } else {
            SceneLogger.getReactiveLog("Building quadtree").set("False");
        }


        if (this.accumulated_alpha !== 0) {
            for (const [ , edge ] of this.edges) {
                edge.update(dt_ms);
                const node1 = edge.start_node;
                const node2 = edge.end_node;

                const attr_force = computeAttraction(node1.pos, node2.pos);

                node1.attr_force.x += attr_force.x;
                node1.attr_force.y += attr_force.y;

                node2.attr_force.x -= attr_force.x;
                node2.attr_force.y -= attr_force.y;
            }
        }

        // Update nodes
        for (const [ id, node ] of this.nodes) {

            if (this.drawable_selected === node) {
                node.repln_force.set(0, 0);
                node.attr_force.set(0, 0);
            } else if (this.force_quad_tree && this.accumulated_alpha !== 0) {
                node.repln_force = this.force_quad_tree.getTotalForcesOnPoint(node.quad_tree_node, computeRepulsion);
            }
            node.update(dt_ms);

            if (this.accumulated_frame_time === 0) {
                const node_el = document.getElementById(id);
                if (node_el)
                    node_el.innerHTML =
                        `<div>id: ${ node.id }</div>` +
                        `<div>alpha: ${ node.alpha }</div>` +
                        `<div> pos: ${ this.getTransformedPoint(node.pos.x, node.pos.y) } </div>` +
                        `<div>vel: ${ Math.round(node.velocity.x * 1000) / 1000 }i + ${ Math.round(node.velocity.y * 1000) / 1000 }</div>` +
                        `<div>force: ${ Math.round(node.force.x * 1000) / 1000 }i + ${ Math.round(node.force.y * 1000) / 1000 }</div>`;
            }
            this.accumulated_node_position_change += Vmath.round(Math.abs(node.position_change.x + node.position_change.y), 2);
            this.accumulated_alpha += node.alpha;
        }

        if (this.drawable_selected) {
            this.ctx.canvas.style.cursor = "pointer";
            this.debounceSelectedNodeAlphaReset.call();
        } else {
            this.ctx.canvas.style.cursor = "default";
        }
        this.animator.step(dt_ms);
    }

    /*******************************************************************************************************************
     ***************************************** SCENE COMMANDS ********************************************************
     *******************************************************************************************************************/
    addNode(id: string, pos: Vector, radius: number): boolean {
        if (this.nodes.has(id))
            return false;
        this.nodes.set(id, new Node(this, id, pos, radius));
        return true;
    }

    addEdge(from_id: string, to_id: string): boolean {
        const node1 = this.nodes.get(from_id);
        const node2 = this.nodes.get(to_id);
        if (!node1 || !node2)
            return false;
        if (this.edges.get(Edge.getEdgeKey(from_id, to_id)))
            return true;


        this.edges.set(Edge.getEdgeKey(from_id, to_id), new Edge(this, node1, node2));
        return true;

    }

    private handleMultiTouchMove(e: TouchEvent) {
        if (!this.pinching_to_zoom || e.touches.length !== 2) return;

        if (!this.initial_touches) {
            this.initial_touches = e.touches;
            return;
        }

        // --- Compute old and new pinch distance ---
        const getDistance = (a: Touch, b: Touch) => {
            const dx = a.clientX - b.clientX;
            const dy = a.clientY - b.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const oldDist = getDistance(this.initial_touches[0], this.initial_touches[1]);
        const newDist = getDistance(e.touches[0], e.touches[1]);

        // Prevent divide by zero
        if (oldDist === 0) return;

        // --- Compute zoom factor ---
        const zoomFactor = newDist / oldDist;
        const newZoom = Vmath.clamp(this.camera.zoom * zoomFactor, Scene.MIN_ZOOM, Scene.MAX_ZOOM);

        // --- Get screen midpoint of new touches ---
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 * devicePixelRatio;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 * devicePixelRatio;

        // --- Compute world point under midpoint before zoom ---
        const worldBefore = this.getTransformedPoint(midX, midY);

        // --- Apply new zoom ---
        this.camera.zoom = newZoom;

        // --- Compute world point under same screen midpoint after zoom ---
        const worldAfter = this.getTransformedPoint(midX, midY);

        // --- Offset camera so world point stays fixed under pinch center ---
        this.camera.x += worldBefore.x - worldAfter.x;
        this.camera.y += worldBefore.y - worldAfter.y;

        // Update for next move
        this.initial_touches = e.touches;
        this.debounceCanvasResizeNodeAlphaReset.call();
    }

    private handleMultiTouch(e: TouchEvent) {

        if (e.touches.length === 2)
            this.pinching_to_zoom = true;


    }

    private handleMouseUp() {
        this.drawable_selected = null;
        this.dragging_camera = false;
    }

    private zoomAt(x: number, y: number, zoom_in: boolean): void {

        const zoom_to = this.camera.zoom + (Scene.ZOOM_DELTA * this.camera.zoom * (zoom_in ? 1 : -1));
        if (zoom_to > Scene.MAX_ZOOM || zoom_to < Scene.MIN_ZOOM)
            return;
        const zoom_from = this.camera.zoom;
        const world_focus = this.getTransformedPoint(x, y); // fixed world point under cursor

        this.animator.add(new ValueAnimation((new_zoom, completed) => {
            this.is_zooming = !completed;
            if (completed)
                this.debounceCanvasResizeNodeAlphaReset.call();

            // Adjust camera to keep the world_focus under the cursor
            this.camera.x = world_focus.x - (x / (devicePixelRatio * new_zoom));
            this.camera.y = world_focus.y - (y / (devicePixelRatio * new_zoom));

            this.camera.zoom = Vmath.clamp(new_zoom, Scene.MIN_ZOOM, Scene.MAX_ZOOM);

        }, zoom_from, zoom_to, 100, EasingFunctions.linear));
    }

    private handleMouseMove(e: MouseEvent | TouchEvent) {
        const val = e instanceof MouseEvent ? e : e.touches[0];
        const pt = this.getTransformedPoint(val.clientX * devicePixelRatio, val.clientY * devicePixelRatio);
        const dx = pt.x - this.prev_mouse_pos.x;
        const dy = pt.y - this.prev_mouse_pos.y;
        if (this.drawable_selected) {
            this.drawable_selected.pos.x += dx;
            this.drawable_selected.pos.y += dy;
            this.prev_mouse_pos.set(pt.x, pt.y);
        } else if (this.dragging_camera) {
            this.camera.x -= dx;
            this.camera.y -= dy;
            SceneLogger.getReactiveLog("mouse translate point").set(`${ pt.x }i+${ pt.y }j`);
        }
    }

    removeNode(id: string): boolean {
        return this.nodes.delete(id);
    }

    highlightNode(id: string): boolean {
        const node = this.nodes.get(id);
        if (!node)
            return false;
        node.highlight();
        return true;
    }

    unhighlightNode(id: string): boolean {
        return false;

    }

    moveNode(id: string, from_pos: Vector, to_pos: Vector): boolean {
        return false;
    }

    labelNode(id: string, label: string): boolean {
        return false;

    }

    private handleMousePressed(e: MouseEvent | TouchEvent) {
        if (!this.nodes) return;

        const val = e instanceof MouseEvent ? e : e.touches[0];
        // Transform mouse coordinates to world space
        const pt = this.getTransformedPoint(val.clientX * devicePixelRatio, val.clientY * devicePixelRatio);
        this.prev_mouse_pos.set(pt.x, pt.y);

        for (const [ , node ] of this.nodes) {
            if (node.containsPoint(pt.x, pt.y)) {
                this.drawable_selected = node;
                break;
            }
        }
        if (!this.drawable_selected)
            this.dragging_camera = true;
    }

    removeEdge(from_id: string, to_id: string): boolean {
        return this.edges.delete(Edge.getEdgeKey(from_id, to_id));
    }

    highlightEdge(from_id: string, to_id: string): boolean {
        const edge = this.edges.get(Edge.getEdgeKey(from_id, to_id));
        if (!edge)
            return false;
        edge.highlight();
        return true;

    }

    unhighlightEdge(from_id: string, to_id: string): boolean {
        return false;

    }

    labelEdge(from_id: string, to_id: string, label: string): boolean {
        return false;

    }

    noop(): boolean {
        return true;
    }

    finished(): boolean {
        return false;

    }

    error(message: string): boolean {
        return false;

    }

    reset(): boolean {
        return false;

    }

    clear(): boolean {
        this.nodes.clear();
        this.edges.clear();
        return true;
    }


}

const softening_factor = 10 ** 2;


export const k_repl = 1e3;
export const k_attr = 1000;
const NATURAL_EDGE_LENGTH = 50;

export function computeRepulsion(node1: QuadTreeNode, node2: QuadTreeNode): Vector {
    const distance_vec = node1.point.subtract(node2.point);
    const dist_sq = distance_vec.length_sqrd();

    const angle = Math.atan2(distance_vec.y, distance_vec.x);

    const force = k_repl / (dist_sq + softening_factor) * node2.mass * node1.mass;
    return new Vector(
        Math.round(force * Math.cos(angle)), //horizontal component of force
        Math.round(force * Math.sin(angle)) //vertical component of force
    );
}


export function computeAttraction(vec1: Vector, vec2: Vector) {
    const distance_vec = vec1.subtract(vec2);
    const dist_sq = distance_vec.length_sqrd();

    if (dist_sq < 0.01) {
        return ZERO_VEC;
    }
    const dist = Math.sqrt(dist_sq);

    const force = k_attr * (dist - NATURAL_EDGE_LENGTH);

    return {
        x: -Math.round(distance_vec.x / dist * force), //horizontal component of force
        y: -Math.round(distance_vec.y / dist * force) //vertical component of force
    };
}

