const crypto = require('crypto');
const path = require('path');

const DIAGRAM_FILE = /^[0-9a-f]{16}\.png$/;

const diagramFileName = (source) => `${crypto.createHash('sha256').update(source).digest('hex').slice(0, 16)}.png`;

const diagramDirOf = (outputPath) => path.join(path.dirname(outputPath), 'diagrams');

const isDiagramBlock = (token) => token.type === 'code' && token.lang === 'mermaid';

module.exports = { DIAGRAM_FILE, diagramFileName, diagramDirOf, isDiagramBlock };
