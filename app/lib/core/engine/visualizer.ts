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

//Visual array
class VArray {
    constructor(private internalArr: number[]) {
    }

    spawn(scene: World, name: string) {

        const stacklayout = new ECStackLayout(name, ECStackLayoutDirection.Horizontal, 10);
        const layoutEntity = scene.createEntity();
        scene.addComponent(layoutEntity, new ECPosition(0, 0))
            .addComponent(layoutEntity, stacklayout)
            .addComponent(layoutEntity, new ECBorderColor(new Color("#00f")));

        for (let i = 0; i < this.internalArr.length; i++) {
            const el = this.internalArr[i]!;
            const elEntity = scene.createEntity();
            scene.addComponent(elEntity, new ECPosition(0, 0))
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

export class Visualizer {
    private readonly scene: World;

    constructor(scene: World, ctx: CanvasRenderingContext2D) {
        this.scene = scene;
        scene.addSystem(new RenderSystem(ctx));
        scene.addSystem(new KinematicsSystem());
        scene.addSystem(new TransitionSystem());
        scene.addSystem(new ESMouseListener(ctx));
        scene.addSystem(new ESDragStateSystem());
        scene.addSystem(new ESDragMoveSystem());
        scene.addSystem(new ESStackLayout());
        // console.log(new ESStackLayout());
        scene.addSystem(new ESMoveTo());


    }

    addArray(arr: number[]) {
        new VArray(arr).spawn(this.scene, "arr");
    }
}
