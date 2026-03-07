// import {Entity} from "~/lib/engine/world/Entity";
import type { EntitySystem } from "./systems/EntitySystem";
import type { EntityComponent } from "./components";
import type { Entity } from "./Entity";
import { SparseSet } from "./SparseSet";
import type { EntityResource } from "./resources/EntityResource";

export type ComponentClass<T extends EntityComponent = EntityComponent> = new (...args: never[]) => T;

export type ResourceClass<T extends EntityResource = EntityResource> = new (...args: never[]) => T;

export class World {
    private id_counter = 0;
    private components = new Map<ComponentClass, SparseSet<EntityComponent>>();
    private entities = new Array<Entity>();

    private entityComponentMap = new Map<Entity, Set<ComponentClass>>();

    private resourceMap = new Map<ResourceClass, EntityResource>();
    private systems: EntitySystem[] = [];

    createEntity(): Entity {
        const entity = {id: this.id_counter++, index: this.entities.length};
        this.entities.push(entity);

        return entity;
    }

    addComponent<T extends EntityComponent>(entity: Entity, component: T): World {
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

    getComponent<T extends EntityComponent>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {
        return this.components.get(componentClass)?.get(entity.id) as T | undefined;
    }

    getComponentStore<T extends EntityComponent>(componentClass: ComponentClass<T>) {
        return this.components.get(componentClass) as SparseSet<T> | undefined;
    }

    getResource<T extends EntityResource>(resourceClass: ResourceClass<T>) : T | undefined {
        return this.resourceMap.get(resourceClass) as T;
    }

    addResource<T extends EntityResource>(resource: EntityResource) {
        const resourceClass: ResourceClass<T> = resource.constructor as ResourceClass<T>;
        this.resourceMap.set(resourceClass, resource)
    }

    entityHas<T extends EntityComponent>(entity: Entity, componentClass: ComponentClass<T>): boolean {
        const sparseSet = this.components.get(componentClass);
        if (!sparseSet)
            return false;

        return sparseSet.contains(entity.id);
    }

    addSystem(system: EntitySystem) {
        system.start();
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

    removeAllSystems(): void {
        this.systems.length = 0;
    }
}