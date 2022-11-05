import { add, dist, div, dot, min, mul, rvec, RVec3, sub } from "../geometry/rvec";
import { Light, Polygon, Polygons } from "../scene/scene";

function shadePolygon(polygon: Polygon, lights: readonly Light[]): RVec3 {
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
                    color = add<3>(color, mul<3>(light.color, lambert));
                    break;
                }
            case "point":
                {
                    let centroid = rvec(3);
                    for (const vert of polygon.verts) {
                        centroid = add<3>(vert, centroid);
                    }
                    centroid = div<3>(centroid, polygon.verts.length);
                    const direction = sub<3>(centroid, light.point);
                    const lambert = Math.max(-dot(direction, polygon.normal), 0);
                    const distanceFactor = Math.min(Math.max(dist(light.point, centroid) / light.radius, 0), 1);
                    color = add<3>(color, mul<3>(light.color, lambert * (1 - distanceFactor)));
                    break;
                }
        }
    }
    return min<3>(color, 1);
}

export default function shadePolygons(polygons: Polygons, lights: readonly Light[]): RVec3[] {
    return polygons.map(p => shadePolygon(p, lights));
}