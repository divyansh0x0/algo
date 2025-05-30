//Axis Aligned Bounding Box
import {Size, Vector} from "./Geometry.mjs";

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
        return new AABB(new Vector(x, y), new Size(w, h));
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
        return Math.abs(vec.x - this.center.x) <= this.half_dimension.width
            && Math.abs(vec.y - this.center.y) <= this.half_dimension.height;

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
    ForceQuadTree.MAX_THRESHOLD_SQRD = document.getElementById("threshold-slider").value ** 2;
}, 100);

/**
 * @te
 */
export class ForceQuadTree {
    static MAX_THRESHOLD_SQRD = 0.7 ** 2;

    /**
     * @param {AABB} boundary
     */
    constructor(boundary) {
        this.boundary = boundary;
        /**
         * @type {ForceQuadTree[]}
         */
        this.regions = [];
        this.has_sub_divisions = false;
        /**@type QuadTreeNode */
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
    insert(point, data) {
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

        let new_node_inserted = false;
        let old_node_inserted = (this.node === null);

        for (const region of this.regions) {
            if (region.insert(point, data)) {
                new_node_inserted = true;
            }
            if (!old_node_inserted && region.insert(this.node.point, this.node.data)) {
                this.node = null;
                old_node_inserted = true;
            }


        }

        /*
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

    getTotalForcesOnPoint(point, force_func) {
        if (this.regions.length === 0)
            return new Vector(0, 0);
        const total_force = new Vector(0, 0);
        let threshold_sqrd = 0;
        let region_size = 0;
        for (const region of this.regions) {
            if (!region.COM)
                continue;
            if (!region.has_sub_divisions && region.boundary.containsPoint(point))
                continue;

            region_size = region.boundary.half_dimension.max();

            threshold_sqrd = (region_size * region_size) / region.COM.sub(point).length_sqrd();
            if (threshold_sqrd > ForceQuadTree.MAX_THRESHOLD_SQRD && region.has_sub_divisions) {
                //iterate over children
                total_force.add_self(region.getTotalForcesOnPoint(point, force_func));
            } else {
                if (region.node !== null)
                    //approximate force
                    total_force.add_self(force_func(point, region.COM));
            }
        }
        return total_force;
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

        if (bounds.containsPoint(this.node.point))
            nodes_in_range.push(this.node);

        if (!this.has_sub_divisions) {
            return nodes_in_range;
        }

        for (const region of this.regions) {
            nodes_in_range.push(...this.tr.getNodesInRange(bounds));
        }
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