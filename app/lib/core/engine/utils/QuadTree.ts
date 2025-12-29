//Axis Aligned Bounding Box
import {Size} from "~/lib/core/engine/utils/Size";
import {Vector2D} from "./Vector2D";
import {AABB} from "./AABB";

const FLOAT_ERROR = 0.01;

function circleIntersectsAABB(circle_center: Vector2D, radius: number, aabb: AABB) {
    // Compute AABB bounds
    const minX = aabb.center.x - aabb.half_dimension.width;
    const maxX = aabb.center.x + aabb.half_dimension.width;
    const minY = aabb.center.y - aabb.half_dimension.height;
    const maxY = aabb.center.y + aabb.half_dimension.height;

    // Clamp circle center to AABB bounds
    const closestX = Math.max(minX, Math.min(circle_center.x, maxX));
    const closestY = Math.max(minY, Math.min(circle_center.y, maxY));

    // Compute squared distance from circle center to closest point
    const dx = circle_center.x - closestX;
    const dy = circle_center.y - closestY;
    const dist_sqrd = dx * dx + dy * dy;

    return dist_sqrd <= radius * radius;
}

function circleContainsPoint(circle_center: Vector2D, radius: number, point: Vector2D) {
    const dx = circle_center.x - point.x;
    const dy = circle_center.y - point.y;
    const dist_sqrd = dx * dx + dy * dy;

    return dist_sqrd <= radius * radius;

}


export class QuadTreeNode {
    constructor(public id: string, public point: Vector2D, public mass: number = 10) {
    }

}

export class ForceQuadTree {

    static ACCURACY = 0.9;
    static FULL_ACCURACY_AREA = new Size(100, 100);
    static FULL_ACCURACY_CIRCLE_RADIUS = 100;
    COM: Vector2D | undefined;
    mass = 0;
    regions: ForceQuadTree[] = [];
    has_sub_divisions: boolean = false;
    boundary: AABB;
    //tr,tl,bl,br
    node: QuadTreeNode | undefined;
    private region_name: string = "";

    constructor(boundary: AABB) {
        this.boundary = boundary;
        this.has_sub_divisions = false;
    }

    subdivide() {
        const half_dim = this.boundary.half_dimension;
        const center = this.boundary.center;
        const tr = new ForceQuadTree(new AABB(
            new Vector2D(center.x + half_dim.width / 2, center.y - half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        const tl = new ForceQuadTree(new AABB(
            new Vector2D(center.x - half_dim.width / 2, center.y - half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        const bl = new ForceQuadTree(new AABB(
            new Vector2D(center.x - half_dim.width / 2, center.y + half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));

        const br = new ForceQuadTree(new AABB(
            new Vector2D(center.x + half_dim.width / 2, center.y + half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        this.regions.push(tr, tl, bl, br);
        this.has_sub_divisions = true;
    }

    contains(pos: Vector2D) {
        return this.boundary.containsPoint(pos);
    }

    insert(node: QuadTreeNode) {
        // Skip object outside this quadtree
        if (!this.boundary.containsPoint(node.point)) {
            return false;
        }

        // If the tree has not been filled and has no subdivisions then store it in the tree
        if (!this.node && !this.has_sub_divisions) {
            this.node = node;
            this.COM = node.point.copy();
            this.mass = node.mass;
            return true;
        }
        //Otherwise subdivide if already not
        if (!this.has_sub_divisions)
            this.subdivide();

        this.region_name = "";
        let old_node_reinserted = false;
        //add old node (if any) to any new subtree which can store it;
        for (const region of this.regions) {
            if (!old_node_reinserted && this.node && region.insert(this.node)) {
                old_node_reinserted = true;
                this.node = undefined;
            }
            this.region_name += region.node?.id ?? "";
        }
        //Add the new node to the subtree
        let new_node_inserted = false;
        for (const region of this.regions) {
            if (region.insert(node)) {
                new_node_inserted = true;
                break;
            }
        }


        // UPDATING COM
        /* ON THE FLY CALCULATION OF COM
         * so this works like this:
         * r1 = sum(mx)/M
         * now if i add a new particle of mass a and position b then
         * r2 = (sum(mx) + ab)/(M + a)
         * now substitude sum(mx) with r1 * M
         r2 = (r1 + ab)/(M + a)

         The following is implementation of r2 = (r1 + ab)/(M + a)
         */

        //the node stored in it will contain com and stuff
        if (new_node_inserted) {
            const new_mass = this.mass + node.mass;
            if (!this.COM)
                return true;
            this.COM
                .scale_self(this.mass)
                .add_self(node.point.scale(node.mass))
                .scale_self(1 / new_mass);
            this.mass = new_mass;

        }
        return new_node_inserted;
    }


    getTotalForcesOnPoint(quad_tree_node: QuadTreeNode, force_func: (a: QuadTreeNode, b: QuadTreeNode) => Vector2D) {
        if (this.regions.length === 0)
            return new Vector2D(0, 0);
        const total_force = new Vector2D(0, 0);
        const nearby_nodes = this.getNodesInCircularRange(quad_tree_node.point, ForceQuadTree.FULL_ACCURACY_CIRCLE_RADIUS);
        for (const other_node of nearby_nodes) {
            if (quad_tree_node.id != other_node.id)
                total_force.add_self(force_func(quad_tree_node, other_node));
        }

        total_force.add_self(this.getForceDueToRegions(quad_tree_node, force_func, nearby_nodes));
        // //console.log(total_force);
        return total_force;
    }

    getForceDueToRegions(quad_tree_node: QuadTreeNode, force_func: (a: QuadTreeNode, b: QuadTreeNode) => Vector2D, excluded_nodes: QuadTreeNode[] = [], depth = 0): Vector2D {
        const force = new Vector2D(0, 0);
        const min_threshold = 1 - ForceQuadTree.ACCURACY;
        for (const region of this.regions) {
            if (!region.COM || region.mass === 0) continue;

            const dx = region.COM.x - quad_tree_node.point.x;
            const dy = region.COM.y - quad_tree_node.point.y;
            let l = dx * dx + dy * dy;

            // Apply Barnes-Hut approximation
            const region_size = region.boundary.half_dimension.width;
            const threshold = region_size / Math.sqrt(l);
            if (threshold >= min_threshold && region.has_sub_divisions) {
                force.add_self(region.getForceDueToRegions(quad_tree_node, force_func, excluded_nodes, depth + 1));
            } else {
                // Skip if same node or at same position
                if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) continue;

                // Apply force using the region's COM and mass
                const tempNode = new QuadTreeNode(region.region_name, region.COM, region.mass);
                force.add_self(force_func(quad_tree_node, tempNode));
            }
        }
        return force;
    }


    getNodesInRange(bounds: AABB): QuadTreeNode[] {
        const nodes_in_range: QuadTreeNode[] = [];
        // If bounds is not in the boundary of quadtree then abort
        if (!this.boundary.intersectsAABB(bounds))
            return nodes_in_range;


        if (!this.has_sub_divisions) {
            if (this.node && bounds.containsPoint(this.node.point))
                nodes_in_range.push(this.node);

            return nodes_in_range;
        }

        for (const region of this.regions) {
            nodes_in_range.push(...region.getNodesInRange(bounds));
        }
        return nodes_in_range;
    }

    getNodesInCircularRange(center: Vector2D, radius: number): QuadTreeNode[] {
        const nodes_in_range: QuadTreeNode[] = [];

        // If bounds is not in the boundary of quadtree then abort
        if (!circleIntersectsAABB(center, radius, this.boundary))
            return nodes_in_range;


        if (!this.has_sub_divisions) {
            if (this.node && circleContainsPoint(center, radius, this.node.point))
                nodes_in_range.push(this.node);

            return nodes_in_range;
        }

        for (const region of this.regions) {
            nodes_in_range.push(...region.getNodesInCircularRange(center, radius));
        }
        return nodes_in_range;
    }

    * getAllRegions(): Generator<ForceQuadTree> {
        yield this;
        if (this.has_sub_divisions) {
            for (const region of this.regions) {
                yield* region.getAllRegions();
            }
        }
    }

    toString() {
        // return `${this.boundary}`
    }
}
