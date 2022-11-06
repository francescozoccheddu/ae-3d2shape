import { ConstRMat4, mul as matMul, orthographicProjMat, perspectiveProjMat, viewMat } from "../geometry/rmat4";
import { add, ConstRVec3, dist, div, dot, homog, min, mul as vecMul, nonHomog, rvec, RVec2, RVec3, sub } from "../geometry/rvec";
import { remDim } from "../geometry/vec";
import { Lights, Polygon, Scene, Vertices } from "../project/project";
import { Render, Shape } from "./render";

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
                    const lambert = Math.max(-dot(light.direction, polygon.normal), 0);
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
                    const lambert = Math.max(-dot(direction, polygon.normal), 0);
                    const distanceFactor = Math.min(Math.max(dist(light.point, centroid) / light.radius, 0), 1);
                    color = add<3>(color, vecMul<3>(light.color, lambert * (1 - distanceFactor)));
                    break;
                }
        }
    }
    return vecMul<3>(min<3>(color, 1), polygon.color);
}

function projectPolygon(polygon: Polygon, mat: ConstRMat4): { vertices: RVec2[], depth: number } {
    const projVerts = polygon.vertices.map(v => nonHomog(matMul(mat, homog(v))));
    return {
        vertices: projVerts.map(remDim<number, 3>),
        depth: Math.min(...projVerts.map(v => v[2]))
    };
}

export default function renderScene(scene: Scene): Render {
    const mat: ConstRMat4 = matMul(
        scene.camera.projection.kind === "perspective"
            ? perspectiveProjMat(scene.camera.projection.fovRad)
            : orthographicProjMat(scene.camera.projection.scale),
        viewMat(scene.camera.view.eye, scene.camera.view.forward, scene.camera.view.up)
    );
    const shapes: Shape[] = [];
    const depthInfo: { readonly depth: number, readonly index: number }[] = [];
    let i = 0;
    for (const polygon of scene.polygons) {
        const { vertices, depth } = projectPolygon(polygon, mat);
        shapes.push({
            vertices,
            fill: shadePolygon(polygon, scene.lights),
            back: dot(scene.camera.view.forward, polygon.normal) >= 0
        });
        depthInfo.push({
            depth,
            index: i++
        });
    }
    depthInfo.sort((a, b) => a.depth - b.depth);
    return {
        strokeColor: scene.strokeColor,
        strokeThickness: scene.strokeThickness,
        shapes,
        shapeIndicesByDepth: depthInfo.map(v => v.index)
    };
}