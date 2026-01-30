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
import type { YNativeValueWrapper } from "../yasl";
import type { Entity } from "./scene/Entity";

type VValueType = null | boolean | string | number | VValueType[];

//Visual array
interface VObject {
    spawn(): void;

    kill(): void;
}

class VArray implements VObject {
    private layout?: Entity;
    private children?: Entity[];
    private stackLayout?: ECStackLayout;
    constructor(private internalArr: VValueType[], private world: World, private name = "unknown") {
    }

    spawn() {

        this.stackLayout = new ECStackLayout(this.name, ECStackLayoutDirection.Horizontal, 10);
        this.layout = this.world.createEntity();
        this.world.addComponent(this.layout, new ECPosition(0, 0))
            .addComponent(this.layout, this.stackLayout)
            .addComponent(this.layout, new ECBorderColor(new Color("#00f")));

        for (let i = 0; i < this.internalArr.length; i++) {
            const el = this.internalArr[i]!;
            const elEntity = this.world.createEntity();
            this.world.addComponent(elEntity, new ECPosition(0, 0))
                .addComponent(elEntity, new ECRectangle(100, 100, ECDrawableStyle.Stroke))
                .addComponent(elEntity, new ECAxisAlignedBoundingBox(50, 50))
                .addComponent(elEntity, new ECText(el.toString()))
                .addComponent(elEntity, new ECTextColor(new Color("#fff")));
            this.stackLayout.add(elEntity);

            this.children?.push(elEntity);
        }
    }

    kill(): void {
        if (this.layout)
            this.world.deleteEntity(this.layout);
        if (this.children)
            this.world.deleteEntities(...this.children);
    }

    swap(index1: number, index2: number): void {
        this.stackLayout?.swap(index1, index2);
    }
}

class VValue implements VObject {
    constructor(private value: VValueType, private world: World, private name = "unknown") {

    }

    private stringify() {
        return JSON.stringify(this.value);
    }

    spawn(): void {
        const entity = this.world.createEntity();
        this.world.addComponent(entity, new ECPosition(0, 0))
            .addComponent(entity, new ECRectangle(100, 100, ECDrawableStyle.Stroke))
            .addComponent(entity, new ECAxisAlignedBoundingBox(50, 50))
            .addComponent(entity, new ECText(this.stringify()))
            .addComponent(entity, new ECTextColor(new Color("#fff")));
    }

    kill(): void {

    }
}

function resolveYASLArray(arr: YNativeValueWrapper[]): VValueType[] {
    const resolvedArr: VValueType[] = [];

    // console.log(arr);
    for (const el of arr) {
        if(!el.isArray())
            resolvedArr.push(el.value as VValueType);
        else
            resolvedArr.push(resolveYASLArray(el.value.getArray()));
    }
    return resolvedArr;
}

export class Visualizer {
    private world?: World;
    private vobjects = new Map<string, VObject>();

    setScene(world: World, ctx: CanvasRenderingContext2D) {
        this.world = world;
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

    addArray(name: string, arr: YNativeValueWrapper[]) {
        if (!this.world) {
            console.error("Scene not set before adding content to visualizer", arr);
            return;
        }
        console.log("Array added", arr);
        const vArr:VValueType[] = resolveYASLArray(arr);

        const vArrObj = new VArray(vArr, this.world, name);
        this.insertObj(name, vArrObj);
    }

    private insertObj(name: string, obj: VObject) {
        if (this.vobjects.has(name)) {
            this.vobjects.get(name)?.kill();
        }
        this.vobjects.set(name, obj);
        obj.spawn();
    }

    // createValue(name: string, value: VValueTypes): void {
    //
    // }
    resetScene(): void {
        for(const value of this.vobjects.values()) {
            value.kill();
        }

        this.vobjects.clear();
        this.world?.clearAllEntities();
    }

    swapArrayElements(name: string, index1: number, index2: number): void {
        const varr = this.vobjects.get(name);
        console.log("Swapping", index1, index2, name, varr,this.vobjects);
        if(!varr) return;

        if(varr instanceof VArray){
            varr.swap(index1,index2);
        }
    }
}
