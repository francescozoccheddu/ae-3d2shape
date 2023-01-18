import { ConstRMat4, mul as matMul, orthographicProjMat, perspectiveProjMat, viewMat } from "../geometry/rmat4";
import { add, ConstRVec3, dist, div, dot, homog, min, mul as vecMul, nonHomog, rvec, RVec2, RVec3, sub } from "../geometry/rvec";
import { clone, remDim, set, vec } from "../geometry/vec";
import { Lights, Polygon, Scene } from "../project/project";
import { SceneRender, SceneShape } from "./render";

function normal(polygon: Polygon) {
    const sum: RVec3 = vec(3, 0);
    for (const n of polygon.normals) {
        set(sum, add(sum, n));
    }
    return div(sum, polygon.normals.length);
}

function shadePolygon(polygon: Polygon, lights: Lights): RVec3 {
    let color: RVec3 = rvec(3);

    for (const light of lights) {
        switch (light.kind) {
            case "ambient":
                {
                    color = add<3>(color, light.color);
                    break;
                }
            case "directional":
                {
                    const lambert = Math.abs(-dot(light.direction, normal(polygon)));
                    color = add<3>(color, vecMul<3>(light.color, lambert));
                    break;
                }
            case "point":
                {
                    let centroid = rvec(3);
                    for (const vert of polygon.vertices) {
                        centroid = add<3>(vert, centroid);
                    }
                    centroid = div<3>(centroid, polygon.vertices.length);
                    const direction = sub<3>(centroid, light.point);
                    const lambert = Math.abs(-dot(direction, normal(polygon)));
                    const distanceFactor = Math.min(Math.max(dist(light.point, centroid) / light.radius, 0), 1);
                    color = add<3>(color, vecMul<3>(light.color, lambert * (1 - distanceFactor)));
                    break;
                }
        }
    }
    return vecMul<3>(min<3>(color, 1), polygon.color);
}

function projectPoint(point: ConstRVec3, mat: ConstRMat4): RVec3 {
    return vecMul<3>(nonHomog(matMul(mat, homog(point))), [1, -1, 1]);
}

function projectPolygon(polygon: Polygon, mat: ConstRMat4): { vertices: RVec2[], depth: number } {
    const projVerts = polygon.vertices.map(v => projectPoint(v, mat));
    let centroid = rvec(3, 0);
    for (const vert of polygon.vertices) {
        centroid = add<3>(vert, centroid);
    }
    centroid = div<3>(centroid, polygon.vertices.length);
    return {
        vertices: projVerts.map(remDim<number, 3>),
        depth: projectPoint(centroid, mat)[2]
    };
}

export default function renderScene(scene: Scene): SceneRender {
    const mat: ConstRMat4 = matMul(
        scene.camera.projection.kind === "perspective"
            ? perspectiveProjMat(scene.camera.projection.fovRad)
            : orthographicProjMat(scene.camera.projection.scale),
        viewMat(scene.camera.view.eye, scene.camera.view.forward, scene.camera.view.up)
    );
    const shapes: SceneShape[] = [];
    const depthInfo: { readonly depth: number, readonly index: number }[] = [];
    let i = 0;
    for (const polygon of scene.polygons) {
        const { vertices, depth } = projectPolygon(polygon, mat);
        shapes.push({
            vertices,
            fill: shadePolygon(polygon, scene.lights),
            back: polygon.normals.every(n => dot(scene.camera.view.forward, n) >= 0)
        });
        depthInfo.push({
            depth,
            index: i++
        });
    }
    depthInfo.sort((a, b) => a.depth - b.depth);
    return {
        strokeColor: clone<number, 3>(scene.strokeColor),
        strokeThickness: scene.strokeThickness,
        shapes,
        shapeIndicesByDepth: depthInfo.map(v => v.index)
    };
}