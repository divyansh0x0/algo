import { type EntitySystem } from "../systems/EntitySystem";
import { ECPosition } from "../components/ECPosition";
import { ECVelocity } from "../components/ECVelocity";
import type { World } from "../World";

export class KinematicsSystem implements EntitySystem {
    start(): boolean {
        return true;
    }

    update(dt: number, world: World): void {
        // console.log("KinematicsSystem update with dt=", dt);
        for (const entity of world.getEntities()) {
            const pos = world.getComponent(entity, ECPosition);
            const vel = world.getComponent(entity, ECVelocity);
            if (pos && vel) {
                pos.x += vel.x * dt;
                pos.y += vel.y * dt;
            }
        }
    }

    end(): void {
    }

}