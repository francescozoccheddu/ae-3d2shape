import loadScene from "./loadScene";
import { Scene } from "./scene";

function main(): void {
    const scene: Scene | null = loadScene();
    if (scene === null) {
        return;
    }
    Window.alert("Hello from After Effects!");
}

try {
    main();
}
catch (e) {
    if ($.level === 0) {
        Window.alert((e as Error).description, "Error while loading the scene", true);
    }
    else {
        throw e;
    }
}