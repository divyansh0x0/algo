function bit(n: number): number {
    return 1 << n;
}

export enum ECID {
    Position,
    Velocity,
    Color,
    Drawable,
    ColorTransition,
    AABB,
    MouseListener,
    Draggable,
    MoveTo,
    Group,
    GroupMember,
    StackLayout,
    Text,
}

export interface EntityComponent {
    readonly id: ECID;
}