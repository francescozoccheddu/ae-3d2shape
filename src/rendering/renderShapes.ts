import { ConstRMat4, mul, orthographicProjMat, perspectiveProjMat, viewMat } from "../geometry/rmat4";
import { ConstRVec2, ConstRVec3, homog, min, minc, nonHomog } from "../geometry/rvec";
import { remDim } from "../geometry/vec";
import { Camera, Polygons } from "../scene/scene";

export type Shape = {
    readonly points: readonly ConstRVec2[],
    readonly depthIndex: number
};

export default function renderShapes(camera: Camera, polygons: Polygons): readonly Shape[] {
    const vMat: ConstRMat4 = viewMat(camera.view.eye, camera.view.forward, camera.view.up);
    const pMat: ConstRMat4 = camera.projection.kind === "orthographic"
        ? orthographicProjMat(camera.projection.scale)
        : perspectiveProjMat(camera.projection.fovRad);
    const mat: ConstRMat4 = mul(pMat, vMat);
    type IntermShape = {
        readonly points: readonly ConstRVec2[],
        readonly depth: number,
        readonly polygonIndex: number
    };
    const intermShapes: IntermShape[] = Array<IntermShape>(polygons.length);
    let polygonIndex: number = 0;
    for (const polygon of polygons) {
        const projVerts: ConstRVec3[] = [];
        for (const vert of polygon.verts) {
            projVerts.push(nonHomog(mul(mat, homog(vert))));
        }
        intermShapes.push({
            points: projVerts.map<ConstRVec2>(remDim<number, 3>),
            depth: Math.min(...projVerts.map(v => v[2])),
            polygonIndex: polygonIndex++
        });
    }
    intermShapes.sort((a, b) => a.depth - b.depth);
    const shapes: Shape[] = Array<Shape>(polygons.length);
    for (let i = 0; i < polygons.length; i++) {
        const intermShape = intermShapes[i];
        shapes[intermShape.polygonIndex] = {
            points: intermShape.points,
            depthIndex: i
        };
    }
    return shapes;
}