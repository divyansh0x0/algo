// import {Entity} from "~/lib/engine/scene/Entity";
import type {EntitySystem} from "~/lib/engine/scene/systems/EntitySystem";
import {Entity} from "./Entity";


export class Scene {
    private id_counter = 0;
    private entities = new Array<Entity>();
    private systems = new Array<EntitySystem>();
    private systemEntities = new Map<EntitySystem, Entity[]>();

    constructor(private readonly show_fps: boolean = false) {

    }

    createEntity() {
        const entity = new Entity(this.id_counter);

        return entity;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
        this.refreshEntity(entity);
        console.debug("Entity added:", entity);
    }

    refreshEntity(entity: Entity) {
        for (const system of this.systems) {
            const list = this.systemEntities.get(system);
            if (!list) continue;
            if (!system.requirement.matches(...entity.getComponentIDs())) {
                if (!list.includes(entity)) {
                    continue;
                }
                const i = list.indexOf(entity);
                const temp = list[i]!;
                list[i] = list[list.length - 1]!;
                list[list.length - 1] = temp;
                console.debug("removed:", list.pop(), "from:", system.constructor);

            } else if (!list.includes(entity)) {
                list.push(entity);
            }
        }
        console.debug("Entity refreshed with id ", entity.id)
    }

    refreshSystemEntities(system: EntitySystem) {
        const list: Entity[] = [];
        for (const ent of this.entities) {
            if (system.requirement.matches(...ent.getComponentIDs())) {
                list.push(ent);
            }
        }
        this.systemEntities.set(system, list);
        console.debug("System entities refreshed:", system.constructor);
    }

    addSystem(system: EntitySystem) {
        if (system.start()) {
            this.systems.push(system);
            this.refreshSystemEntities(system);
        }

    }

    update(dt: number) {
        for (const system of this.systems) {
            // console.log(system,this.systemEntities, this.entities)
            system.update(dt, this.systemEntities.get(system) || []);
        }
        for (const entity of this.entities) {
            const componentsToRemove = entity.getMarkedForRemovalComponents();
            if (componentsToRemove.size === 0) continue;
            entity.remove(...componentsToRemove);
            this.refreshEntity(entity);
        }
    }
}