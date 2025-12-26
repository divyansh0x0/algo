import type {Scene} from "~/lib/engine/scene/Scene";
import {ECBorderColor, ECDrawableStyle, ECPosition, ECRectangle, ECTextColor} from "~/lib/engine/scene/components";
import {ECStackLayout, ECStackLayoutDirection} from "~/lib/engine/scene/components/ECStackLayout";
import {ESStackLayout} from "~/lib/engine/scene/systems/ESStackLayout";
import {ECAxisAlignedBoundingBox} from "~/lib/engine/scene/components/ECAxisAlignedBoundingBox";
import {RenderSystem} from "~/lib/engine/scene/systems/ESRender";
import {KinematicsSystem} from "~/lib/engine/scene/systems/ESKinematics";
import {TransitionSystem} from "~/lib/engine/scene/systems/ESTransition";
import {ESMouseListener} from "~/lib/engine/scene/systems/ESMouseListener";
import {ESDragStateSystem} from "~/lib/engine/scene/systems/ESDragStateSystem";
import {ESDragMoveSystem} from "~/lib/engine/scene/systems/ESDragMoveSystem";
import {ESMoveTo} from "~/lib/engine/scene/systems/ESMoveTo";
import {ECText} from "~/lib/engine/scene/components/ECText";
import {Color} from "~/lib/engine/utils/Color";
import {ECGroupMember} from "~/lib/engine/scene/components/ECGroupMember";

//Visual array
class VArray {
    constructor(private internalArr: number[]) {
    }

    spawn(scene: Scene, name: string) {

        const stacklayout = new ECStackLayout(name, ECStackLayoutDirection.Horizontal, 10);
        const layoutEntity = scene.createEntity()
            .add(new ECPosition(0, 0))
            .add(stacklayout).add(new ECBorderColor(new Color("#00f")));
        // console.log(layoutEntity);
        scene.addEntity(layoutEntity);
        for (let i = 0; i < this.internalArr.length; i++) {
            const el = this.internalArr[i]!;
            const elEntity = scene.createEntity();
            elEntity.add(new ECPosition(0, 0))
                .add(new ECRectangle(100, 100, ECDrawableStyle.Stroke))
                .add(new ECAxisAlignedBoundingBox(50, 50))
                .add(new ECText(el.toString()))
                .add(new ECTextColor(new Color("#fff"))).add(new ECGroupMember(i));
            stacklayout.members.push(elEntity);
            // console.log(el);
            scene.addEntity(elEntity);
        }

        // console.log(stacklayout);

    }
}

export class Visualizer {
    private readonly scene: Scene;

    constructor(scene: Scene, ctx: CanvasRenderingContext2D) {
        this.scene = scene;
        scene.addSystem(new RenderSystem(ctx));
        scene.addSystem(new KinematicsSystem());
        scene.addSystem(new TransitionSystem());
        scene.addSystem(new ESMouseListener(ctx));
        scene.addSystem(new ESDragStateSystem());
        scene.addSystem(new ESDragMoveSystem());
        scene.addSystem(new ESStackLayout())
        // console.log(new ESStackLayout());
        scene.addSystem(new ESMoveTo());
    }

    addArray(arr: number[]) {
        new VArray(arr).spawn(this.scene, "arr");
    }
}
