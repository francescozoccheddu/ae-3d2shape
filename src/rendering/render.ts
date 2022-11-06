import { ConstRVec2, ConstRVec3 } from "../geometry/rvec";

export type Shape = {
    readonly vertices: readonly ConstRVec2[];
    readonly fill: ConstRVec3;
    readonly back: boolean;
};

export type Render = {
    readonly strokeColor: ConstRVec3;
    readonly strokeThickness: number;
    readonly shapes: readonly Shape[];
    readonly shapeIndicesByDepth: readonly number[];
};

export default Render;