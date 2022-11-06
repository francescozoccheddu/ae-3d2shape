import doing from "../utils/doing";
import coerceProject from "./coerceProject";
import { buildDefinitions } from "./definitions";
import { coerceObject } from "./fundamentals";
import { Project } from "./project";

function loadFile(): object | null {
    const file = File.openDialog("Load a scene", "JSON files:*.json,All files:*.*", false);
    if (file === null) {
        return null;
    }
    let json: string;
    try {
        file.open("r");
        json = file.read();
        file.close();
    } catch (e) {
        throw new Error("File access error.");
    }
    try {
        return JSON.parse(json);
    } catch (e) {
        throw new Error("JSON error.");
    }
}

export default function loadProject(): Project | null {
    const json = doing("reading project file", loadFile);
    if (json === null) {
        return null;
    }
    const obj = coerceObject(json);
    const defs = buildDefinitions((json as any).definitions);
    return doing("parsing project", () => coerceProject(json, defs));
}