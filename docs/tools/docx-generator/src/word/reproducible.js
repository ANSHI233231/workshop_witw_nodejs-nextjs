const JSZip = require('jszip');
const { config } = require('../config');

const RANDOM_REL_ID = /rId[a-z0-9_-]{15,}/g;

async function reproducible(buffer) {
    const fixed = new Date(config.fixedTimestamp);
    const source = await JSZip.loadAsync(buffer);
    const names = Object.keys(source.files)
        .filter((name) => !source.files[name].dir)
        .sort();

    const isXml = (name) => /\.(xml|rels)$/.test(name);
    const texts = {};
    const relIds = new Map();
    for (const name of names.filter(isXml)) {
        texts[name] = await source.files[name].async('string');
    }
    for (const name of ['word/document.xml', ...names.filter(isXml)]) {
        for (const id of texts[name]?.match(RANDOM_REL_ID) ?? []) {
            if (!relIds.has(id)) relIds.set(id, `rIdLink${relIds.size + 1}`);
        }
    }

    const out = new JSZip();
    for (const name of names) {
        let content = isXml(name)
            ? Buffer.from(texts[name].replace(RANDOM_REL_ID, (id) => relIds.get(id)))
            : await source.files[name].async('nodebuffer');
        if (name === 'docProps/core.xml') {
            content = Buffer.from(
                content
                    .toString('utf8')
                    .replace(/(<dcterms:created[^>]*>)[^<]*(<\/dcterms:created>)/, `$1${config.fixedTimestamp}$2`)
                    .replace(/(<dcterms:modified[^>]*>)[^<]*(<\/dcterms:modified>)/, `$1${config.fixedTimestamp}$2`),
            );
        }
        out.file(name, content, { date: fixed, createFolders: false });
    }
    return out.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
        platform: 'UNIX',
    });
}

module.exports = { reproducible };
