import appRootPath from "app-root-path";
import browserify from 'browserify';
import { Buffer } from 'buffer';
import convertSourceMap from "convert-source-map";
import fs from "fs";
import tsify from 'tsify';

const mainSourceFile: string = appRootPath.resolve("src/main.ts");
const mainSourceFileAi: string = appRootPath.resolve("src/ai/main.ts");
const projectFileAi: string = appRootPath.resolve("src/ai/tsconfig.json");
const stubSourceFile: string = appRootPath.resolve("build/stub.js");
const projectFile: string = appRootPath.resolve("src/tsconfig.json");

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

async function compileStub(): Promise<string> {
    return (await fs.promises.readFile(stubSourceFile)).toString();
}

async function injectStub(source: string): Promise<string> {
    const originalMap = convertSourceMap.fromSource(source)!.toObject();
    const stubSource = await compileStub();
    var offset = stubSource.match(/\n/g)!.length;
    var offsetMap = require('offset-sourcemap-lines')(originalMap, offset);
    var sourceBody = convertSourceMap.removeComments(source);
    var offsetMapComment = convertSourceMap.fromObject(offsetMap).toComment();
    return stubSource + sourceBody + offsetMapComment;
}

async function compileSource(debug: boolean = true, ai: boolean = false): Promise<string> {
    let pipeline = browserify({ debug })
        .add(ai ? mainSourceFileAi : mainSourceFile)
        .plugin(tsify, { project: ai ? projectFileAi : projectFile })
        .transform("babelify", { extensions: ['.ts', '.js'], presets: ['extendscript', '@babel/preset-env'], global: true });
    return await streamToString(pipeline.bundle());;
}

async function compileSourceAndStub(debug: boolean = true, stub: boolean = debug, ai: boolean = false): Promise<string> {
    const source = await compileSource(debug, ai);
    return stub ? await injectStub(source) : source;
}

export default async function build(outFile: string, debug: boolean = true, ai: boolean = false): Promise<void> {
    const bundle = await compileSourceAndStub(debug, debug && !ai, ai);
    await fs.promises.writeFile(outFile, bundle);
}