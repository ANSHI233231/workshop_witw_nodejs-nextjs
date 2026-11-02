#!/usr/bin/env node
const fs = require('fs');
const { Packer } = require('docx');
const { config, resolveFromConfig, repoPath } = require('../config');
const { buildDocument } = require('../word/document');
const { reproducible } = require('../word/reproducible');
const { diagramDirOf } = require('../diagrams/files');

async function render(sourcePath, outputPath) {
    const { doc } = buildDocument(fs.readFileSync(sourcePath, 'utf8'), diagramDirOf(outputPath));
    return reproducible(await Packer.toBuffer(doc));
}

async function main() {
    const check = process.argv.includes('--check');
    let stale = 0;

    for (const { source, output } of config.documents) {
        const sourcePath = resolveFromConfig(source);
        const outputPath = resolveFromConfig(output);
        const buffer = await render(sourcePath, outputPath);

        if (check) {
            const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath) : null;
            if (current && current.equals(buffer)) {
                console.log(`ok       ${repoPath(outputPath)}`);
            } else {
                console.error(`STALE    ${repoPath(outputPath)}  (run: npm run build)`);
                stale++;
            }
        } else {
            fs.writeFileSync(outputPath, buffer);
            console.log(`written  ${repoPath(outputPath)}  (${buffer.length} bytes)`);
        }
    }

    if (stale) process.exit(1);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
