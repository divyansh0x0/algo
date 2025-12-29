import type {Entity} from "../Entity";
import {ECID} from "~/lib/core/engine/scene/components";

export class ESRequirements {
    private uniqueMask = 0;
    private count = 0;

    static from(...IDs: ECID[]) {
        const requirements = new ESRequirements();
        for (const id of IDs) {
            const mask = 1 << id;
            requirements.uniqueMask |= mask;
        }
        requirements.count = IDs.length;
        return requirements;
    }

    match(id: ECID) {
        const idBitMask = 1 << id;
        return (this.uniqueMask & idBitMask) === idBitMask;
    }

    matches(...componentIDs: ECID[]) {
        let matchedIdsCount = 0;
        for (const componentID of componentIDs) {
            if (this.match(componentID)) {
                ++matchedIdsCount;
            }
        }
        return matchedIdsCount === this.count;
    }
}

export interface EntitySystem {
    requirement: ESRequirements;

    start(): boolean;

    update(dt: number, entities: Entity[]): void;

    end(): void;
}