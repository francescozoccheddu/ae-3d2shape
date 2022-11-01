import Ajv from "ajv";
import ajvStandalone from "ajv/dist/standalone";
import appRootPath from "app-root-path";
import fs from "fs";

const outFile: string = appRootPath.resolve("validator/validator.js");

const schemaFiles: string[] = [
    "camera-property",
    "camera",
    "color-property",
    "color",
    "light-property",
    "light",
    "polygon-property",
    "polygon",
    "scene",
    "stroke-width-property",
    "stroke-width",
    "time",
    "vector-property",
    "vector"
].map(f => appRootPath.resolve(`schemas/${f}.json`));

const sceneSchemaId: string = "https://github.com/francescozoccheddu/ae-3d2shape/schemas/scene.json";

export default async function buildValidator(debug: boolean = true): Promise<void> {
    const ajv: Ajv = new Ajv({ code: { source: true, es5: true, esm: false, optimize: !debug } });
    ajv.opts.unicodeRegExp = false;
    for (const schemaFile of schemaFiles) {
        const json = (await fs.promises.readFile(schemaFile)).toString();
        ajv.addSchema(JSON.parse(json));
    }
    const validate = ajv.getSchema(sceneSchemaId);
    const js = ajvStandalone(ajv, validate);
    await fs.promises.writeFile(outFile, js);
}
