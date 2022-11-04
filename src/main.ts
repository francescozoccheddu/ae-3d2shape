import doing from "./utils/doing";
import loadScene from "./scene/loadScene";
import { Scene } from "./scene/scene";

function main(): void {
    const scene: Scene | null = doing("loading scene file", loadScene);
    if (scene === null) {
        return;
    }
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