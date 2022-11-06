import doing from "./utils/doing";
import loadProject from "./project/loadProject";
import { Project } from "./project/project";
import renderScene from "./rendering/renderScene";
import renderProject from "./rendering/renderProject";

function main(): void {
    const project: Project | null = doing("loading project file", loadProject);
    if (project === null) {
        return;
    }
    const render = renderProject(project, [500, 500]);
    Window.alert("Reached the end of the script without any error!");
}

try {
    main();
}
catch (e) {
    if ($.level === 0) {
        Window.alert((e as Error).description, "Error while importing the scene", true);
    }
    else {
        throw e;
    }
}