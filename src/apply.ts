import { ProjectRender } from "./rendering/render";

export default function apply(render: ProjectRender): void {
    const aeComposition = app.project.activeItem;
    if (!(aeComposition instanceof CompItem)) {
        throw new Error("No active composition.");
    }
    if (render.frames.length == 0) {
        throw new Error("No keyframes.");
    }
    app.beginUndoGroup("ae-3d2shape");
    aeComposition.duration = Math.max(aeComposition.duration, render.frames[render.frames.length - 1].time);
    // layer
    const aeLayer = aeComposition.layers.addShape();
    aeLayer.name = render.name;
    const aeRootVectorGroup = aeLayer.property("ADBE Root Vectors Group") as PropertyGroup;
    // groups
    for (let s = 0; s < render.frames[0].shapes.length; s++) {
        const aeVectorGroup = aeRootVectorGroup.addProperty("ADBE Vector Group").property("ADBE Vectors Group") as PropertyGroup;
        const aePathGroupIndex = aeVectorGroup.addProperty("ADBE Vector Shape - Group").propertyIndex;
        const aeFillGroupIndex = aeVectorGroup.addProperty("ADBE Vector Graphic - Fill").propertyIndex;
        for (let k = 0; k < render.frames.length; k++) {
            const frame = render.frames[k];
            const shape = frame.shapes[s];
            const aeShape = new Shape();
            aeShape.vertices = shape.vertices;
            (aeVectorGroup.property(aePathGroupIndex).property("ADBE Vector Shape") as Property).setValueAtTime(frame.time, aeShape);
            (aeVectorGroup.property(aeFillGroupIndex).property("ADBE Vector Fill Color") as Property).setValueAtTime(frame.time, shape.fill);
        }
    }
    // stroke
    const aeStrokeGroup = aeRootVectorGroup.addProperty("ADBE Vector Graphic - Stroke") as PropertyGroup;
    // anchor point
    const aeAnchorPoint = (aeLayer.property("ADBE Transform Group") as _TransformGroup).anchorPoint as TwoDProperty;
    app.endUndoGroup();
}