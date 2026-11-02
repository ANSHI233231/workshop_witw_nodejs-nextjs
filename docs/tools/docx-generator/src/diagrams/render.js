const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');
const { isDiagramBlock } = require('./files');

const MERMAID_CLI = '@mermaid-js/mermaid-cli@11.4.2';
const RENDER_OPTIONS = ['--width', '1400', '--scale', '2', '--backgroundColor', 'white', '--quiet'];

function diagramsOf(sourcePath) {
    const sources = [];
    marked.walkTokens(marked.lexer(fs.readFileSync(sourcePath, 'utf8')), (token) => {
        if (isDiagramBlock(token)) sources.push(token.text);
    });
    return sources;
}

function renderDiagram(source, imagePath, workDir) {
    const input = path.join(workDir, 'diagram.mmd');
    fs.writeFileSync(input, source);
    execFileSync('npx', ['-y', MERMAID_CLI, '--input', input, '--output', imagePath, ...RENDER_OPTIONS], {
        stdio: 'inherit',
    });
}

module.exports = { diagramsOf, renderDiagram };
