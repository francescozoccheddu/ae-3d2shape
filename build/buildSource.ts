import appRootPath from "app-root-path";
import browserify from 'browserify';
import { Buffer } from 'buffer';
import fs from "fs";
import tsify from 'tsify';

const mainSrcFile: string = appRootPath.resolve("src/main.ts");
const projectFile: string = appRootPath.resolve("src/tsconfig.json");

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

export default async function buildSource(outFile: string, debug: boolean = true): Promise<void> {
    let pipeline = browserify({ debug })
        .add(mainSrcFile)
        .plugin(tsify, { project: projectFile })
        .transform("babelify", { extensions: ['.ts', '.js'], presets: ['extendscript', '@babel/preset-env'], global: true });
    if (!debug) {
        pipeline = pipeline.plugin("tinyify");
    }
    const bundle = await streamToString(pipeline.bundle());
    const iifeBundle = `(function(){${bundle}})();`;
    await fs.promises.writeFile(outFile, iifeBundle);
}