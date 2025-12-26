import {type EntitySystem, ESRequirements} from "~/lib/engine/scene/systems/EntitySystem";
import type {Entity} from "../Entity";
import {ECID} from "../components/EntityComponent";
import {ECPosition} from "../components/ECPosition";
import {ECVelocity} from "../components/ECVelocity";

export class KinematicsSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Position, ECID.Velocity);

    start(): boolean {
        return true;
    }

    update(dt: number, entities: Entity[]): void {
        // console.log("KinematicsSystem update with dt=", dt);
        for (const ent of entities) {
            const pos = ent.get(ECPosition);
            const vel = ent.get(ECVelocity);
            if (pos && vel) {
                pos.x += vel.x * dt;
                pos.y += vel.y * dt;
            }
        }
    }

    end(): void {
    }

}