// import {Entity} from "~/lib/engine/scene/Entity";
import type {EntitySystem} from "~/lib/core/engine/scene/systems/EntitySystem";
import {Entity} from "./Entity";
import type { EntityComponent } from "./components";
import { SparseSet } from "./SparseSet";
import { sys } from "typescript";

type ComponentClass<T extends EntityComponent = EntityComponent> =
    new (...args: any[]) => T;
export class World {
    private id_counter = 0;
    private components = new Map<ComponentClass, SparseSet<EntityComponent>>();
    private entities = new Set<Entity>();
    private systems: EntitySystem[] = []
    createEntity():Entity{
        const id = this.id_counter++;
        const entity = new Entity(id);
        this.entities.add(entity);

        return entity;
    }
    addComponent<T extends EntityComponent>(entity:Entity, component:T){
        let sparseSet = this.components.get(component.constructor as ComponentClass<T>);
        if(!sparseSet){
            sparseSet = new SparseSet<T>();
            this.components.set(component.constructor as ComponentClass<T>, sparseSet);
        }
        sparseSet.add(entity.id, component);
        return this;
    }
    removeComponent<T extends EntityComponent>(entity:Entity, componentClass: ComponentClass<T>){
        let sparseSet = this.components.get(componentClass);
        if(sparseSet){
            sparseSet.remove(entity.id);
        }
    }
    getComponent<T extends EntityComponent>(entity:Entity, componentClass: ComponentClass<T>){
        return this.components.get(componentClass)?.get(entity.id) as T | undefined;
    }

    getComponentStore<T extends EntityComponent>(componentClass:ComponentClass<T>){
        return this.components.get(componentClass) as SparseSet<T> | undefined;
    }

    entityHas<T extends EntityComponent>(entity:Entity, componentClass: ComponentClass<T>): Entity {
        const sparseSet = this.components.get(componentClass)
        if(!sparseSet)
            return false;

        return sparseSet.contains(entity.id);
    }
    addSystem(system:EntitySystem){
        this.systems.push(system);
        return this;
    }

    update(dt_ms:number){
        for (let index = 0; index < this.systems.length; index++) {
            const system = this.systems[index];
            
            system?.update(dt_ms,this);
        }
    }

    getEntities(){
        return this.entities;
    }
}