import {
    ECBorderColor,
    ECDrawableStyle,
    ECPosition,
    ECRectangle,
    ECTextColor
} from "~/lib/core/engine/scene/components";
import { ECAxisAlignedBoundingBox } from "~/lib/core/engine/scene/components/ECAxisAlignedBoundingBox";
import { ECStackLayout, ECStackLayoutDirection } from "~/lib/core/engine/scene/components/ECStackLayout";
import { ECText } from "~/lib/core/engine/scene/components/ECText";
import { ESDragMoveSystem } from "~/lib/core/engine/scene/systems/ESDragMoveSystem";
import { ESDragStateSystem } from "~/lib/core/engine/scene/systems/ESDragStateSystem";
import { KinematicsSystem } from "~/lib/core/engine/scene/systems/ESKinematics";
import { ESMouseListener } from "~/lib/core/engine/scene/systems/ESMouseListener";
import { ESMoveTo } from "~/lib/core/engine/scene/systems/ESMoveTo";
import { RenderSystem } from "~/lib/core/engine/scene/systems/ESRender";
import { ESStackLayout } from "~/lib/core/engine/scene/systems/ESStackLayout";
import { TransitionSystem } from "~/lib/core/engine/scene/systems/ESTransition";
import type { World } from "~/lib/core/engine/scene/World";
import { Color } from "~/lib/core/engine/utils/Color";

type VValueTypes = null | string | number | Array<unknown>;

//Visual array
interface VObject {
    spawn(world: World): void;
}

class VArray implements VObject {
    constructor(private internalArr: number[], private name="unknown") {
    }

    spawn(world: World) {

        const stacklayout = new ECStackLayout(this.name, ECStackLayoutDirection.Horizontal, 10);
        const layoutEntity = world.createEntity();
        world.addComponent(layoutEntity, new ECPosition(0, 0))
            .addComponent(layoutEntity, stacklayout)
            .addComponent(layoutEntity, new ECBorderColor(new Color("#00f")));

        for (let i = 0; i < this.internalArr.length; i++) {
            const el = this.internalArr[i]!;
            const elEntity = world.createEntity();
            world.addComponent(elEntity, new ECPosition(0, 0))
                .addComponent(elEntity, new ECRectangle(100, 100, ECDrawableStyle.Stroke))
                .addComponent(elEntity, new ECAxisAlignedBoundingBox(50, 50))
                .addComponent(elEntity, new ECText(el.toString()))
                .addComponent(elEntity, new ECTextColor(new Color("#fff")));
            stacklayout.add(elEntity);
        }
        setInterval(() => {
            stacklayout.swap(2, 3);
        }, 2000);
        // console.log(stacklayout);

    }
}

class VValue implements VObject{
    constructor(private value: VValueTypes) {

    }

    spawn(world: World):void {
    }
}

export class Visualizer {
    private world?: World;
    private vobjects = new Map<string, VValue>();

    setScene(world: World, ctx: CanvasRenderingContext2D) {
        this.world = world;
        this.world.clearAll();
        console.log("world set", this.world);

        world.addSystem(new RenderSystem(ctx));
        world.addSystem(new KinematicsSystem());
        world.addSystem(new TransitionSystem());
        world.addSystem(new ESMouseListener(ctx));
        world.addSystem(new ESDragStateSystem());
        world.addSystem(new ESDragMoveSystem());
        world.addSystem(new ESStackLayout());
        world.addSystem(new ESMoveTo());
    }

    addArray(arr: number[]) {
        if (!this.world) {
            console.error("Scene not set before adding content to visualizer", arr);
            return;
        }
        console.log("Array added", arr);
        new VArray(arr).spawn(this.world);

    }

    createValue(name: string, value: VValueTypes): void {

    }
}
