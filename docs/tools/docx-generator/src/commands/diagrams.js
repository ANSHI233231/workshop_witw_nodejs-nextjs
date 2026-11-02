#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { config, resolveFromConfig, repoPath } = require('../config');
const { DIAGRAM_FILE, diagramFileName, diagramDirOf } = require('../diagrams/files');
const { diagramsOf, renderDiagram } = require('../diagrams/render');

function main() {
    const wanted = new Map();
    for (const { source, output } of config.documents) {
        const diagramDir = diagramDirOf(resolveFromConfig(output));
        if (!wanted.has(diagramDir)) wanted.set(diagramDir, new Map());
        for (const diagram of diagramsOf(resolveFromConfig(source))) {
            wanted.get(diagramDir).set(diagramFileName(diagram), diagram);
        }
    }

    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docx-diagrams-'));
    try {
        for (const [diagramDir, diagrams] of wanted) {
            if (diagrams.size) fs.mkdirSync(diagramDir, { recursive: true });

            for (const [name, source] of diagrams) {
                const imagePath = path.join(diagramDir, name);
                if (fs.existsSync(imagePath)) {
                    console.log(`ok       ${repoPath(imagePath)}`);
                    continue;
                }
                renderDiagram(source, imagePath, workDir);
                console.log(`drawn    ${repoPath(imagePath)}`);
            }

            if (!fs.existsSync(diagramDir)) continue;
            for (const file of fs.readdirSync(diagramDir)) {
                if (DIAGRAM_FILE.test(file) && !diagrams.has(file)) {
                    fs.unlinkSync(path.join(diagramDir, file));
                    console.log(`removed  ${repoPath(path.join(diagramDir, file))}`);
                }
            }
        }
    } finally {
        fs.rmSync(workDir, { recursive: true, force: true });
    }
}

main();
