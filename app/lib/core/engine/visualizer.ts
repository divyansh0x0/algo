import type { YNativeValueWrapper } from "../yasl";
import { Color } from "./utils";
import {
    ECBorderColor,
    ECDrawableStyle,
    ECPosition,
    ECRectangle,
    ECStackLayout,
    ECStackLayoutDirection,
    ECTextColor,ECText,ECAxisAlignedBoundingBox
} from "./world/components";
import type { Entity } from "./world/Entity";
import { ERCamera, ERMouse } from "./world/resources";
import { ESCamera, ESMoveTo, ESStackLayout, KinematicsSystem, RenderSystem, TransitionSystem } from "./world/systems";
import type { World } from "./world/World";


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
        if (this.layout) this.world.deleteEntity(this.layout);
        if (this.children) this.world.deleteEntities(...this.children);
    }

    swap(index1: number, index2: number): void {
        this.stackLayout?.swap(index1, index2);
    }
}

class VValue implements VObject {
    constructor(private value: VValueType, private world: World, private name = "unknown") {

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

    private stringify() {
        return JSON.stringify(this.value);
    }
}

function resolveYASLArray(arr: YNativeValueWrapper[]): VValueType[] {
    const resolvedArr: VValueType[] = [];

    // console.log(arr);
    for (const el of arr) {
        if (!el.isArray()) resolvedArr.push(el.value as VValueType); else resolvedArr.push(resolveYASLArray(el.value.getArray()));
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
        world.addSystem(new ESStackLayout());
        world.addSystem(new ESMoveTo());
        world.addSystem(new ESCamera());

        world.addResource(new ERCamera(ctx));
        world.addResource(new ERMouse(ctx));
    }

    addArray(name: string, arr: YNativeValueWrapper[]) {
        if (!this.world) {
            console.error("Scene not set before adding content to visualizer", arr);
            return;
        }
        console.log("Array added", arr);
        const vArr: VValueType[] = resolveYASLArray(arr);

        const vArrObj = new VArray(vArr, this.world, name);
        this.insertObj(name, vArrObj);
    }

    // }
    resetScene(): void {
        for (const value of this.vobjects.values()) {
            value.kill();
        }

        this.vobjects.clear();
        this.world?.clearAllEntities();
    }

    // createValue(name: string, value: VValueTypes): void {
    //

    swapArrayElements(name: string, index1: number, index2: number): void {
        const varr = this.vobjects.get(name);
        console.log("Swapping", index1, index2, name, varr, this.vobjects);
        if (!varr) return;

        if (varr instanceof VArray) {
            varr.swap(index1, index2);
        }
    }

    private insertObj(name: string, obj: VObject) {
        if (this.vobjects.has(name)) {
            this.vobjects.get(name)?.kill();
        }
        this.vobjects.set(name, obj);
        obj.spawn();
    }
}
