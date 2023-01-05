import { RVec2, RVec3 } from "../geometry/rvec";

export type SceneShape = {
    vertices: RVec2[];
    fill: RVec3;
    back: boolean;
};

export type SceneRender = {
    strokeColor: RVec3;
    strokeThickness: number;
    shapes: SceneShape[];
    shapeIndicesByDepth: number[];
};

export type ProjectFrameShape = {
    vertices: RVec2[];
    fill: RVec3;
};

export type ProjectFrameRender = {
    strokeColor: RVec3;
    strokeThickness: number;
    shapes: ProjectFrameShape[];
    time: number;
};

export type ProjectRender = {
    frames: ProjectFrameRender[];
    name: string;
}