//Axis Aligned Bounding Box
import {Size, Vector} from "./Geometry.mjs";

const FLOAT_ERROR = 0.01;

function circleIntersectsAABB(circle_center, radius, aabb) {
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

function circleContainsPoint(circle_center, radius, point) {
    const dx = circle_center.x - point.x;
    const dy = circle_center.y - point.y;
    const dist_sqrd = dx * dx + dy * dy;

    return dist_sqrd <= radius * radius;

}

export class AABB {
    /**
     *
     * @param {Vector} center
     * @param {Size} half_dimension
     */
    constructor(center, half_dimension) {
        this.center = center;
        this.half_dimension = half_dimension;
    }

    static fromRect(x, y, w, h) {
        return new AABB(new Vector(x + w / 2, y + h / 2), new Size(w / 2, h / 2));
    }

    update(center, half_dimension) {
        this.center = center;
        this.half_dimension = half_dimension;
    }

    /**
     * Checks if point is inside this rectangle
     * @param {Vector} vec
     */
    containsPoint(vec) {
        return Math.abs(vec.x - this.center.x) < this.half_dimension.width
            && Math.abs(vec.y - this.center.y) < this.half_dimension.height;

    }

    /**
     * @param {AABB} other
     * @returns {boolean}
     */
    intersectsAABB(other) {
        return this.center.x - other.center.x < this.half_dimension.width + other.half_dimension.width
            && this.center.y - other.center.y < this.half_dimension.height + other.half_dimension.height;
    }

    toString() {
        return `${this.center} ${this.half_dimension}`;
    }

}

class QuadTreeNode {
    /**
     * @param {Vector} point
     * @param data
     */
    constructor(point, data) {
        this.point = point;
        this.data = data;
    }

}

setInterval(() => {
    ForceQuadTree.MIN_THRESHOLD = 1 - document.getElementById("threshold-slider").value;
}, 100);

/**
 * @te
 */
export class ForceQuadTree {
    static MIN_THRESHOLD = 0.7;
    static FULL_ACCURACY_AREA = new Size(100, 100);
    static FULL_ACCURACY_CIRCLE_RADIUS = 100;

    /**
     * @param {AABB} boundary
     */
    constructor(boundary) {
        this.boundary = boundary;
        //@type {ForceQuadTree[]}
        this.regions = [];
        this.has_sub_divisions = false;
        //@type QuadTreeNode
        this.node = null;
        this.COM = null;
        this.mass = 0;
    }

    subdivide() {
        const half_dim = this.boundary.half_dimension;
        const center = this.boundary.center;
        this.tr = new ForceQuadTree(new AABB(
            new Vector(center.x + half_dim.width / 2, center.y - half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        this.tl = new ForceQuadTree(new AABB(
            new Vector(center.x - half_dim.width / 2, center.y - half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        this.bl = new ForceQuadTree(new AABB(
            new Vector(center.x - half_dim.width / 2, center.y + half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));

        this.br = new ForceQuadTree(new AABB(
            new Vector(center.x + half_dim.width / 2, center.y + half_dim.height / 2),
            this.boundary.half_dimension.scale(0.5)
        ));
        this.regions.push(this.tr, this.tl, this.bl, this.br);
        this.has_sub_divisions = true;

        // console.log(this.regions)
    }

    /**
     *
     * @param {Vector} point
     * @param [data]
     * @returns {boolean}
     */
    insert(point, data = {mass: 1}) {
        // Skip object outside this quadtree
        if (!this.boundary.containsPoint(point)) {
            return false;
        }

        // If the tree has not been filled and has no subdivisions then store it in the tree
        if (!this.node && !this.has_sub_divisions) {
            this.node = new QuadTreeNode(point, data);
            this.COM = point.copy().scale(data.mass);
            this.mass = data.mass;
            return true;
        }
        //Otherwise subdivide if already not and add old node (if any) and new node to any new subtree which can store it;
        if (!this.has_sub_divisions)
            this.subdivide();

        let old_node_inserted = (this.node === null);
        if (!old_node_inserted) {
            for (const region of this.regions) {
                if (region.insert(this.node.point, this.node.data)) {
                    this.node = null;
                    old_node_inserted = true;
                    break; // Important
                }
            }
        }
        let new_node_inserted = false;
        for (const region of this.regions) {
            if (region.insert(point, data)) {
                new_node_inserted = true;
                break;
            }
        }

        /* ON THE FLY CALCULATION OF COM
         * so this works like this:
         * r1 = sum(mx)/M
         * now if i add a new particle of mass a and position b then
         * r2 = (sum(mx) + ab)/(M + a)
         * now substitude sum(mx) with r1 * M
         r2 = (r1 + ab)/(M + a)

         The following is implementation of r2 = (r1 + ab)/(M + a)
         */
        const new_mass = this.mass + data.mass;
        this.COM.scale_self(this.mass).add_self(point.scale(data.mass)).scale_self(1 / new_mass);
        this.mass = new_mass;

        if (new_node_inserted && old_node_inserted)
            return true;

        //COM calculation
        return false;
    }

    /**
     * @param {Vector} point
     * @param data
     * @param {function(Vector,Vector,number)} force_func
     * @returns {Vector}
     */
    getTotalForcesOnPoint(point, data = {mass: 1}, force_func) {
        if (this.regions.length === 0)
            return new Vector(0, 0);
        const total_force = new Vector(0, 0);
        const nearby_nodes = this.getNodesInCircularRange(point, ForceQuadTree.FULL_ACCURACY_CIRCLE_RADIUS);
        for (const node of nearby_nodes) {
            if (data === node.data)
                continue;
            total_force.add_self(force_func(point, node.point, node.data.mass));
        }

        total_force.add_self(this.getForceDueToRegions(point, data, force_func, nearby_nodes));
        // console.log(total_force);
        return total_force;
    }

    getForceDueToRegions(point, data, force_func, excluded_nodes = [], depth = 0) {
        const force = new Vector();
        let region_size = 0;
        let threshold = 0;
        let dx = 1;
        let dy = 1;
        for (const region of this.regions) {
            if (!region.COM)
                continue;


            region_size = region.boundary.half_dimension.width;

            dx = region.COM.x - point.x;
            dy = region.COM.y - point.y;
            threshold = (region_size) / Math.sqrt(dx * dx + dy * dy);
            // console.log(threshold_sqrd)
            if (threshold > ForceQuadTree.MIN_THRESHOLD && region.has_sub_divisions) {
                //Add force due to sub regions
                force.add_self(region.getForceDueToRegions(point, data, force_func, excluded_nodes, depth + 1));

            } else {
                if (!region.has_sub_divisions && region.node && region.node.data === data || excluded_nodes.includes(region.node)) {
                    continue;
                }
                if (Math.abs(region.COM.x - point.x) < FLOAT_ERROR && Math.abs(region.COM.y - point.y) < FLOAT_ERROR)
                    continue;
                force.add_self(force_func(point, region.COM, region.mass));
            }
        }
        return force;
    }

    /**
     *
     * @param {AABB} bounds
     * @returns {QuadTreeNode[]}
     */
    getNodesInRange(bounds) {
        const nodes_in_range = [];
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

    getNodesInCircularRange(center, radius) {
        const nodes_in_range = [];

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

    * getAllRegions() {
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

    /**
     *
     * @param {Vector} point
     * @param {function(Vector, Vector)} force_func
     * @returns {Readonly<Vector>}
     */


}