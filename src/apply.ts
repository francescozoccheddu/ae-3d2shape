import { ProjectRender } from "./rendering/render";

export default function apply(render: ProjectRender): void {
    const composition = app.project.activeItem;
    if (!(composition instanceof CompItem)) {
        throw new Error("No active composition.");
    }
    if (render.frames.length == 0) {
        throw new Error("No keyframes.");
    }
    app.beginUndoGroup("ae-3d2shape");
    composition.duration = Math.max(composition.duration, render.frames[render.frames.length - 1].time);
    const layer = composition.layers.addShape();
    layer.name = render.name;
    const anchorPoint = (layer.property("ADBE Transform Group") as _TransformGroup).anchorPoint;
    const rootGroup = layer.property("ADBE Root Vectors Group") as PropertyGroup;

    for (const shape of render.frames[0].shapes) {
        const group = rootGroup.addProperty("ADBE Vector Shape - Group") as PropertyGroup;
        group.addProperty("ADBE Vector Graphic - Fill");
    }
    app.endUndoGroup();
}