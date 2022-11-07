import apply from "./apply";
import loadProject from "./project/loadProject";
import { Project } from "./project/project";
import renderProject from "./rendering/renderProject";
import doing from "./utils/doing";

function main(): void {
    const project: Project | null = doing("loading project file", loadProject);
    if (project === null) {
        return;
    }
    const aeComposition = app.project.activeItem;
    if (!(aeComposition instanceof CompItem)) {
        throw new Error("No active composition.");
    }
    const render = doing("rendering project", () => renderProject(project, [aeComposition.width, aeComposition.height]));
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