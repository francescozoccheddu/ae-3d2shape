import loadProject from "../project/loadProject";
import { Project } from "../project/project";
import renderProject from "../rendering/renderProject";
import doing from "../utils/doing";
import apply from "./apply";

function main(): void {
    if (app.documents.length == 0) {
        throw new Error("No active document.");
    }
    const aiDoc = app.activeDocument;
    const project: Project | null = doing("loading project file", loadProject);
    if (project === null) {
        return;
    }
    const render = doing("rendering project", () => renderProject(project, [aiDoc.width, aiDoc.height]));
    doing("applying render", () => apply(render));
    Window.alert("Successfully imported!", "ae-3d2shape");
}

try {
    main();
}
catch (e) {
    if ($.level === 0) {
        Window.alert("Import failed:\n".concat((e as Error).description), "ae-3d2shape", true);
    }
    else {
        throw e;
    }
}