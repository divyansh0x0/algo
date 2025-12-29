import type {EntityComponent} from "~/lib/core/engine/scene/components";

/**
 * Stores entities and their components, allowing O(1) addition, removal, and lookup of components.
 *
 * Sparse array: Indexed by entity ID. Each entry stores the index of that entity in the dense array.
 * For example, if entity ID is 2, sparse[2] gives the index in the dense array where the component is stored.
 *
 * Dense array: Stores entity IDs contiguously, ensuring cache-friendly iteration.
 * Components array (aligned with dense): Stores the actual component data corresponding to each entity in the dense array.
 */

export class SparseSet<T> {
    private sparse: Int32Array;  // Maps entity ID to its index in the dense array
    private dense = new Array<number>();   // Stores entity IDs in a contiguous array for cache-friendly iteration
    private components = new Array<T>();   // Stores component data aligned with the dense array

    constructor(maxEntities:number = 10000){
        // If an index is not assigned its value defaults to -1
        this.sparse = new Int32Array(maxEntities).fill(-1);
    }
    add(id: number, component:T){
        if(id > this.sparse.length){
            console.error("Maximum entities exceeded");
            return;
        }
        if(this.sparse[id] === undefined){
            console.log("this.sparse[id] was undefined while adding")
            return;
        }

        if (this.sparse[id] !== -1) {
            console.warn(`Entity ${id} already has a component`);
            this.components[this.sparse[id]] = component; // overwrite
            return;
        }

        this.dense.push(id);
        this.components.push(component);
        this.sparse[id] = this.dense.length - 1;
    }
    remove(id:number){
        if(this.sparse[id] === undefined)
            return;
        const denseIndex = this.sparse[id];
        if(denseIndex === -1) return;

        const lastIndex = this.dense.length - 1;
        const lastDenseId = this.dense[lastIndex]!;

        // Swap last index with at index of id in dense array and components
        this.dense[denseIndex] = lastDenseId;
        this.components[denseIndex] = this.components[lastIndex]!;

        // Update sparse index of last item swapped in dense array
        this.sparse[lastDenseId] = denseIndex;

        // Remove last elements
        this.dense.pop();
        this.components.pop();


        // Mark this entity removed
        this.sparse[id] = -1;
    }

    contains(id:number):boolean{
        if(this.sparse[id] === undefined || this.sparse[id] === -1){
            return false;
        }
        return this.dense[this.sparse[id]] === id;
    }

    get(id:number): T|undefined{
        if(this.sparse[id] === undefined || this.sparse[id] === -1) return undefined;
        return this.components[this.sparse[id]];
    }
     [Symbol.iterator](): Iterator<T> {
        return this.components[Symbol.iterator]();
    }
    

}
