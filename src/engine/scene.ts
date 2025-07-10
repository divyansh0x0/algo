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

    constructor(private func: (...args: any[]) => any, private wait_ms: number) {
        this.lastCall = -wait_ms;
    }

    call(...args: any[]) {
        const now = Date.now();
        if (now - this.lastCall >= this.wait_ms) {
            this.lastCall = now;
            this.func(...args);
        }
    }
}


class Camera {
    public camera_updated = true;
    public onupdate: Function | null = null;

    constructor() {}

    private _x = 0;

    public get x() {return this._x;}

    public set x(x_new: number) {
        this._x = x_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }

    private _y = 0;

    public get y() {return this._y;}

    public set y(y_new: number) {
        this._y = y_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }

    private _zoom = 1;

    public get zoom() {return this._zoom;}

    public set zoom(zoom_new: number) {
        this._zoom = zoom_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }
}

export class Scene {

    static ZOOM_DELTA = 0.3;
    static MIN_ZOOM = 0.1;
    static MAX_ZOOM = 10;

    readonly animator = new Animator();
    private camera = new Camera();
    private target_frame_rate = 60;
    private nodes: Map<string, Node> = new Map;
    private edges: Map<string, Edge> = new Map;
    private accumulated_alpha: number = 0;
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
    private bounds: AABB = AABB.fromRect(0, 0, 0, 0);
    private required_size: Size | null = null;
    private offset: Vector = new Vector(0);
    private debounceSelectedNodeAlphaReset: Throttle;

    private readonly mouse_info: Mouse;
    private readonly start_btn: HTMLButtonElement;
    private dragging_camera: boolean = false;
    private is_zooming: boolean = false;

    private initial_touches: TouchList | null = null;
    private pinching_to_zoom: boolean = false;
    private repaint_drawables: boolean = false;
    private bounds_updated: boolean = false;
    private last_draw_image: HTMLImageElement | null = null;
    private is_loop_running: boolean = false;

    constructor(public ctx: CanvasRenderingContext2D, private readonly show_fps: boolean = false) {
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.show_fps = show_fps;
        this.is_running = false;
        this.debug_box_el = document.getElementById("debug-box") as HTMLInputElement;

        this.mouse_info = new Mouse(this.ctx.canvas);

        this.camera.onupdate = () => this.updateBounds(this.ctx.canvas.width, this.ctx.canvas.height);

        this.debounceSelectedNodeAlphaReset = new Throttle((node: Node) => {

            if (!node || !this.force_quad_tree)
                return;
            if (node.alpha < 0.5)
                node.alpha = 0.5;
            for (const quad_node of this.force_quad_tree.getNodesInCircularRange(node.pos, 300)) {
                const other = this.nodes.get(quad_node.id);
                if (!other)
                    continue;
                if (other.alpha < 0.5) {
                    other.alpha = 0.6;
                }

            }
        }, 100);

        const resize_observer = new ResizeObserver((entries) => {
            const el = entries[0].target;
            this.updateBounds(el.clientWidth, el.clientHeight);
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

    /*
     --------------------------------------------------------------------------------------------------------------------
     ------------------------------------------ GAME LOOP ---------------------------------------------------------------
     --------------------------------------------------------------------------------------------------------------------
     */
    async loop(curr_animation_call_time: number) {
        const t1 = this.last_animation_call_time;
        const dt_ms = curr_animation_call_time - this.last_animation_call_time;
        this.last_animation_call_time = curr_animation_call_time;


        if (this.is_running) {
            this.update(dt_ms);
            this.animator.step(dt_ms);
        }

        this.render();

        SceneLogger.getReactiveLog("FPS").set(this.fps.toString());
        SceneLogger.getReactiveLog("Target FPS").set(this.target_frame_rate.toString());
        SceneLogger.getReactiveLog("ZOOM").set(this.camera.zoom.toString());
        SceneLogger.getReactiveLog("Camera").set(`${ this.camera.x }i + ${ this.camera.y }j`);
        SceneLogger.getReactiveLog("Accumulated Alpha").set(this.accumulated_alpha.toString());
        SceneLogger.getReactiveLog("Nodes").set(this.nodes.size.toString());
        SceneLogger.getReactiveLog("Edges").set(this.edges.size.toString());
        SceneLogger.getReactiveLog("Bounds").set(this.bounds.half_dimension.toString());
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
        if (!this.is_loop_running)
            this.loop(this.last_animation_call_time).then(() => this.is_loop_running = true);
        this.start_btn.innerHTML = PAUSE_ICON_SVG;
    }

    stop() {
        this.render();

        this.is_running = false;
        this.accumulated_frame_time = 0;
        this.fps = 0;
        this.fps_counter = 0;
        this.start_btn.innerHTML = PLAY_ICON_SVG;
    }

    render() {
        const dpr = devicePixelRatio || 1;
        this.ctx.setTransform(
            dpr * this.camera.zoom, 0,
            0, dpr * this.camera.zoom,
            -this.camera.x * dpr * this.camera.zoom,
            -this.camera.y * dpr * this.camera.zoom
        );

        if (!this.camera.camera_updated && !this.bounds_updated && !this.repaint_drawables) {
            if (!this.last_draw_image) {
                this.ctx.canvas.toBlob((blob) => {
                    if (!blob)
                        return;
                    this.last_draw_image = new Image();
                    this.last_draw_image.loading = "eager";
                    this.last_draw_image.src = URL.createObjectURL(blob);
                }, "image/png", 1);
            } else if (this.last_draw_image.complete) {
                const point = this.getTransformedPoint(0, 0);
                const inv_scale = 1 / (this.camera.zoom * dpr);
                this.ctx.drawImage(this.last_draw_image, point.x, point.y, this.ctx.canvas.width * inv_scale, this.ctx.canvas.height * inv_scale);
                SceneLogger.getReactiveLog("Rendering").set("False");
                return;
            }
        }
        SceneLogger.getReactiveLog("Rendering").set("True");

        if (this.camera.camera_updated || this.bounds_updated || this.repaint_drawables) {
            this.last_draw_image = null;
        }


        this.camera.camera_updated = false;
        this.repaint_drawables = false;

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
            if (!this.force_quad_tree?.contains(node.pos))
                continue;
            node?.render();

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

    update(dt_ms: number) {

        this.accumulated_alpha = 0;
        for (const [ , node ] of this.nodes) {
            this.accumulated_alpha += node.alpha;
        }
        if (this.accumulated_alpha !== 0 || this.bounds_updated || this.camera.camera_updated) {
            this.force_quad_tree = new ForceQuadTree(this.bounds);

            //Building QUADTREE
            for (const [ , node ] of this.nodes) {
                this.force_quad_tree.insert(node.quad_tree_node);
            }
            SceneLogger.getReactiveLog("Building quadtree").set("True");
            this.repaint_drawables = true;
            this.bounds_updated = false;
        } else {
            SceneLogger.getReactiveLog("Building quadtree").set("False");
        }

        if (this.accumulated_alpha !== 0) {
            for (const [ , edge ] of this.edges) {
                edge.update(dt_ms);
                const node1 = edge.start_node;
                const node2 = edge.end_node;

                const attr_force = computeAttraction(node1, node2);

                node1.attr_force.x += attr_force.x;
                node1.attr_force.y += attr_force.y;

                node2.attr_force.x -= attr_force.x;
                node2.attr_force.y -= attr_force.y;
            }

            let required_size_changed = false;
            for (const [ id, node ] of this.nodes) {

                if (this.drawable_selected === node || !this.force_quad_tree!.contains(node.pos)) {
                    node.repln_force.set(0, 0);
                    node.attr_force.set(0, 0);
                } else if (this.force_quad_tree && this.accumulated_alpha !== 0) {
                    node.repln_force = this.force_quad_tree.getTotalForcesOnPoint(node.quad_tree_node, computeRepulsion);
                }
                // if (!this.force_quad_tree!.contains(node.pos)) {
                //     if (!this.required_size)
                //         this.required_size = this.bounds.half_dimension.scale(2);
                //
                //     //get gap between centers of node and aabb
                //     const padding = 300;
                //     const gap_vec = node.pos.subtract(this.bounds.center);
                //     const new_width= Math.abs(gap_vec.dot(Vector.unit_x))*2 + padding
                //     const new_height= Math.abs(gap_vec.dot(Vector.unit_y))*2 + padding
                //     this.required_size.set(new_width > this.required_size.width ? new_width :
                // this.required_size.width, new_height > this.required_size.height ? new_height :
                // this.required_size.height); required_size_changed = true; SceneLogger.getReactiveLog("Required
                // size").set(this.required_size.toString()) }

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
            }
            if (required_size_changed && this.required_size)
                this.updateBounds(this.required_size.width, this.required_size.height);

        }

        if (this.drawable_selected) {
            this.ctx.canvas.style.cursor = "pointer";
            this.debounceSelectedNodeAlphaReset.call(this.drawable_selected);
        } else {
            this.ctx.canvas.style.cursor = "default";
        }
    }

    /**
     * Adds node to scene
     */
    addNode(id: string, pos: Vector, radius: number): boolean {
        if (this.nodes.has(id))
            return false;
        const node = new Node(this, id, pos, radius);
        this.nodes.set(id, node);
        this.debounceSelectedNodeAlphaReset.call(node);
        this.accumulated_alpha += node.alpha;

        return true;
    }

    /*
     --------------------------------------------------------------------------------------------------------------------
     ------------------------------------------ EVENT HANDLERS ------------------------------------------------------------
     --------------------------------------------------------------------------------------------------------------------
     */

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

            // Adjust camera to keep the world_focus under the cursor
            this.camera.x = world_focus.x - (x / (devicePixelRatio * new_zoom));
            this.camera.y = world_focus.y - (y / (devicePixelRatio * new_zoom));

            this.camera.zoom = Vmath.clamp(new_zoom, Scene.MIN_ZOOM, Scene.MAX_ZOOM);

        }, zoom_from, zoom_to, 100, EasingFunctions.linear));
    }

    addEdge(from_id: string, to_id: string): boolean {
        const node1 = this.nodes.get(from_id);
        const node2 = this.nodes.get(to_id);
        if (!node1 || !node2)
            return false;
        if (this.edges.get(Edge.getEdgeKey(from_id, to_id)))
            return true;


        node1.alpha = 0.5;
        node2.alpha = 0.5;
        this.edges.set(Edge.getEdgeKey(from_id, to_id), new Edge(this, node1, node2));
        return true;

    }


    /*
     --------------------------------------------------------------------------------------------------------------------
     ------------------------------------------SCENE COMMANDS------------------------------------------------------------
     --------------------------------------------------------------------------------------------------------------------
     */

    private updateBounds(new_width: number, new_height: number) {
        const inv_scale = 1 / (devicePixelRatio * this.camera.zoom);
        const canvas_width = new_width * inv_scale;
        const canvas_height = new_height * inv_scale;
        const topLeft = this.getTransformedPoint(0, 0);
        const bottomRight = this.getTransformedPoint(canvas_width, canvas_height);
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        const padding = 100;


        this.bounds.updateRect(topLeft.x - padding, topLeft.y - padding, width + 2 * padding, height + 2 * padding);
        this.bounds_updated = true;
    }

    private handleMouseMove(e: MouseEvent | TouchEvent) {
        const val = e instanceof MouseEvent ? e : e.touches[0];
        const pt = this.getTransformedPoint(val.clientX * devicePixelRatio, val.clientY * devicePixelRatio);
        const dx = pt.x - this.prev_mouse_pos.x;
        const dy = pt.y - this.prev_mouse_pos.y;
        if (this.drawable_selected) {
            this.drawable_selected.pos.x += dx;
            this.drawable_selected.pos.y += dy;
            if (this.drawable_selected instanceof Node)
                this.drawable_selected.position_change.set(dx, dy);
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

export const NATURAL_EDGE_LENGTH = 0;
export const k_repl = 100000;
export const k_attr = 10000;

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


export function computeAttraction(node1: Node, node2: Node) {
    const natural_gap = node1.radius + node2.radius + NATURAL_EDGE_LENGTH;
    const natural_gap_sqrd = natural_gap ** 2;
    const distance_vec = node1.pos.subtract(node2.pos);
    const dist_sq = distance_vec.length_sqrd();

    if (dist_sq < 0.01) {
        return ZERO_VEC;
    }

    const force = k_attr * (dist_sq - natural_gap_sqrd);

    return {
        x: -Math.round(distance_vec.x / dist_sq * force), //horizontal component of force
        y: -Math.round(distance_vec.y / dist_sq * force) //vertical component of force
    };
}

