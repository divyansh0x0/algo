import type {ECID, EntityComponent} from "~/lib/core/engine/scene/components/EntityComponent";

type ComponentClass<T extends EntityComponent = EntityComponent> =
    new (...args: any[]) => T;

export class Entity {

    private componentIds = new Set<ECID>();
    private components = new Map<ComponentClass, EntityComponent>();
    private markedComponents = new Set<ComponentClass>();

    constructor(public readonly id: number) {

    }

    // // Add a component
    // add<T extends EntityComponent>(component: T): Entity {

    //     this.components.set(component.constructor as ComponentClass, component);
    //     this.componentIds.add(component.id);
    //     return this;
    // }

    // // Remove a component by class
    // remove<T extends EntityComponent>(...componentClasses: ComponentClass[]): void {
    //     for (const componentClass of componentClasses) {
    //         const comp = this.components.get(componentClass);
    //         if (!comp) return;

    //         this.componentIds.delete(comp.id);
    //         this.components.delete(componentClass);
    //         this.markedComponents.delete(componentClass);
    //     }
    // }

    // // Get a component by class
    // get<T extends EntityComponent>(componentClass: ComponentClass<T>): T | undefined {
    //     return this.components.get(componentClass) as T | undefined;
    // }

    // // Check if entity has a component
    // has<T extends EntityComponent>(componentClass: ComponentClass<T>): boolean {
    //     return this.components.has(componentClass);
    // }

    // getComponentIDs() {
    //     return this.componentIds.values();
    // }

    // markForRemoval(componentClass: ComponentClass) {
    //     this.markedComponents.add(componentClass);
    // }

    // getMarkedForRemovalComponents() {
    //     return this.markedComponents;
    // }
}