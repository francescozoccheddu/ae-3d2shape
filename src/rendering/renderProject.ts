import { ConstRVec2, div, maxc, minc, mul, RVec2 } from "../geometry/rvec";
import { set } from "../geometry/vec";
import { Fit, FrameSize, Project } from "../project/project";
import { ProjectRender, SceneRender, SceneShape } from "./render";
import renderScene from "./renderScene";

function getScale(frameSize: FrameSize, targetSize: ConstRVec2, fit: Fit): number {
    const scaleToFit = div<2>(targetSize, mul<2>(frameSize, 2));
    switch (fit) {
        case "width":
            return scaleToFit[0];
        case "height":
            return scaleToFit[1];
        case "min":
            return minc(scaleToFit);
        case "max":
            return maxc(scaleToFit);
    }
}

function transformPoint(point: RVec2, scale: number): void {
    set(point, mul(point, scale));
}

function transform(keyframes: readonly SceneRender[], scale: number): void {
    for (const keyframe of keyframes) {
        for (const shape of keyframe.shapes) {
            for (const vert of shape.vertices) {
                transformPoint(vert, scale);
            }
        }
    }
}

function cullBack(keyframes: readonly SceneRender[]): void {
    if (keyframes.length === 0) {
        return;
    }
    for (let p = 0; p < keyframes[0].shapes.length; p++) {
        let allBack = true;
        for (let k = 0; k < keyframes.length; k++) {
            if (!keyframes[k].shapes[p].back) {
                allBack = false;
                break;
            }
        }
        if (allBack) {
            for (let k = 0; k < keyframes.length; k++) {
                keyframes[k].shapes.splice(p, 1);
            }
            p--;
        }
    }
}

function sort(keyframes: readonly SceneRender[], indices: readonly number[]) {
    for (const keyframe of keyframes) {
        const sortedShapes: SceneShape[] = [];
        for (const index of indices) {
            sortedShapes.push(keyframe.shapes[index]);
        }
        for (let i = 0; i < sortedShapes.length; i++) {
            keyframe.shapes[i] = sortedShapes[i];
        }
    }
}

export default function renderProject(project: Project, targetSize: ConstRVec2): ProjectRender {
    const keyframes = project.keyframes.map(k => ({
        ...renderScene(k.scene),
        time: k.time
    }));
    transform(keyframes, getScale(project.frameSize, targetSize, project.fit));
    sort(keyframes, keyframes[0].shapeIndicesByDepth);
    if (project.cullBack) {
        cullBack(keyframes);
    }
    return {
        frames: keyframes,
        name: project.name
    };
}