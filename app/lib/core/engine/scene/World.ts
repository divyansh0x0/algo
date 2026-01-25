// import {Entity} from "~/lib/engine/scene/Entity";
import type { EntitySystem } from "~/lib/core/engine/scene/systems/EntitySystem";
import type { EntityComponent } from "./components";
import type { Entity } from "./Entity";
import { SparseSet } from "./SparseSet";

type ComponentClass<T extends EntityComponent = EntityComponent> =
    new (...args: any[]) => T;

export class World {
    private id_counter = 0;
    private components = new Map<ComponentClass, SparseSet<EntityComponent>>();
    private entities = new Array<Entity>();

    private entityComponentMap = new Map<Entity, Set<ComponentClass>>();
    private systems: EntitySystem[] = [];

    createEntity(): Entity {
        const entity = {id: this.id_counter++, index: this.entities.length};
        this.entities.push(entity);

        return entity;
    }

    addComponent<T extends EntityComponent>(entity: Entity, component: T) {
        const componentClass: ComponentClass = component.constructor as ComponentClass<T>;
        let sparseSet = this.components.get(componentClass);
        if (!sparseSet) {
            sparseSet = new SparseSet<T>();
            this.components.set(componentClass, sparseSet);
        }
        sparseSet.add(entity.id, component);

        // Add component to component map

        let set = this.entityComponentMap.get(entity);
        if (!set) {
            set = new Set<ComponentClass>();
            this.entityComponentMap.set(entity, set);
        }
        set.add(componentClass);
        return this;
    }

    removeComponent<T extends EntityComponent>(entity: Entity, componentClass: ComponentClass<T>) {
        const sparseSet = this.components.get(componentClass);
        sparseSet?.remove(entity.id);
        this.entityComponentMap.get(entity)?.delete(componentClass);
    }

    getComponent<T extends EntityComponent>(entity: Entity, componentClass: ComponentClass<T>) {
        return this.components.get(componentClass)?.get(entity.id) as T | undefined;
    }

    getComponentStore<T extends EntityComponent>(componentClass: ComponentClass<T>) {
        return this.components.get(componentClass) as SparseSet<T> | undefined;
    }

    entityHas<T extends EntityComponent>(entity: Entity, componentClass: ComponentClass<T>): boolean {
        const sparseSet = this.components.get(componentClass);
        if (!sparseSet)
            return false;

        return sparseSet.contains(entity.id);
    }

    addSystem(system: EntitySystem) {
        if(!this.systems.includes(system))
            this.systems.push(system);
        return this;
    }

    update(dt_ms: number) {
        for (let index = 0; index < this.systems.length; index++) {
            const system = this.systems[index];

            system?.update(dt_ms, this);
        }
    }

    getEntities() {
        return this.entities;
    }

    clearAll(): void {
        this.components.clear();
        this.entities.length = 0;
        this.systems.length = 0;
        this.id_counter = 0;
    }

    deleteEntity(entity: Entity): void {
        const componentTypes = this.entityComponentMap.get(entity);
        const index = entity.index;
        const last = this.entities.length - 1;
        if (componentTypes) {
            for (const componentClass of componentTypes) {
                this.components.get(componentClass)?.remove(entity.id);
            }
        }

        console.log("deleting:", entity, "from", this.entities);
        //swap and remove
        if(index !== last) {
            const lastEntity = this.entities[last]!;
            this.entities[index] = lastEntity;
            lastEntity.index = index;

        }
        this.entities.pop();
        this.entityComponentMap?.delete(entity);

    }

    deleteEntities(...entities: Entity[]): void {
        for (let i = 0; i < entities.length; i++){
            const entity = entities[i]!;
            this.deleteEntity(entity);
        }
    }

    clearAllEntities(){
        this.components.clear();
        this.entities.length = 0;
        this.id_counter = 0;
    }
}