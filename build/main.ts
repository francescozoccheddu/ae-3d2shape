import appRootPath from "app-root-path";
import fs from "fs";
import isValidPath from 'is-valid-path';
import path from "path";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import build from "./build";

function coerceOutFile(file: string): string {
    if (!isValidPath(file)) {
        throw new Error(`Invalid file path: "${file}"`);
    }
    const parent = path.dirname(file);
    try {
        fs.accessSync(parent, fs.constants.W_OK);
    } catch (err) {
        throw new Error(`Cannot write in file directory: "${parent}"`);
    }
    return path.normalize(file);
}

export default async function main(): Promise<number> {
    const version = require('project-version');
    const args = await yargs(hideBin(process.argv))
        .strict()
        .usage('$0 (build [-o <out_file>] [-d]')
        .help('h').alias('h', 'help')
        .option('o', {
            type: 'string',
            alias: 'out_file',
            describe: 'The output HTML page',
            default: appRootPath.resolve(`ae-3d2shape-${version}.jsx`),
            coerce: coerceOutFile
        })
        .option('d', {
            type: 'boolean',
            alias: 'debug',
            describe: 'Debug mode',
            default: false
        })
        .strict()
        .parse();

    const spinner = (await import('ora')).default();
    spinner.start("Building source...");
    try {
        await build(args.o, args.d);
        spinner.succeed(`Successfully built "${args.o}"`);
    }
    catch (e) {
        spinner.fail("Failed.");
        console.error(e);
        return 1;
    }
    return 0;
}

if (require.main === module) {
    main().then(process.exit);
}