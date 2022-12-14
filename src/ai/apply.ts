import { ProjectRender } from "../rendering/render";

export default function apply(render: ProjectRender): void {
    if (render.frames.length == 0) {
        throw new Error("No frames.");
    }
    const aiDoc = app.activeDocument;
    const aiLayer = aiDoc.layers.add();
    aiLayer.name = render.name;
    let fi = 0;
    for (const frame of render.frames) {
        const aiGroup = aiLayer.groupItems.add();
        aiGroup.name = "Frame " + fi++;
        for (const shape of frame.shapes.reverse()) {
            const aiPath = aiGroup.pathItems.add();
            aiPath.setEntirePath(shape.vertices.map(v => [v[0], -v[1]]));
            aiPath.closed = true;
            {
                aiPath.stroked = frame.strokeThickness > 0;
                const aiColor = new RGBColor();
                aiColor.red = frame.strokeColor[0] * 255;
                aiColor.green = frame.strokeColor[1] * 255;
                aiColor.blue = frame.strokeColor[2] * 255;
                aiPath.strokeColor = aiColor;
            }
            {
                aiPath.filled = true;
                const aiColor = new RGBColor();
                aiColor.red = shape.fill[0] * 255;
                aiColor.green = shape.fill[1] * 255;
                aiColor.blue = shape.fill[2] * 255;
                aiPath.fillColor = aiColor;
            }
            aiPath.strokeWidth = frame.strokeThickness;
            aiPath.strokeCap = StrokeCap.ROUNDENDCAP;
            aiPath.strokeJoin = StrokeJoin.ROUNDENDJOIN;
        }
        aiGroup.translate(aiDoc.width / 2, -aiDoc.height / 2);
    }
}