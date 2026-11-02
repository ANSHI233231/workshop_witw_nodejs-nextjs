# Docs generator (Markdown → Word)

Turns the repo's Markdown documents into Word (`.docx`) files that look the same and are byte-identical every time, whoever runs it and on whatever machine. Its documents are the workflows in [docs/how-it-works/workflows/](../../how-it-works/workflows/README.md): the `.md` there is the source, and the `.docx` goes into its `documents/` folder.

**The Markdown is the source of truth.** Never edit a generated `.docx` by hand: the next build overwrites it.

## Use

```bash
cd docs/tools/docx-generator
npm ci            # first time, or after the lockfile changes; installs the exact pinned versions
npm run diagrams  # draws each Mermaid diagram's picture, only for diagrams that changed
npm run build     # regenerates every document listed in docs.config.json
npm run check     # fails (exit 1) if any committed .docx doesn't match its .md
```

**After editing a document's `.md`:** run `npm run diagrams` (if a diagram changed) and `npm run build`, then commit the `.md`, the `.docx` and the diagram pictures **together**. Before committing any docs change, `npm run check` must pass.

## Layout

| Path | What it holds |
|---|---|
| `docs.config.json` | the documents to generate (source `.md` → output `.docx`), the author and the fixed timestamp |
| `src/commands/` | what the npm scripts run: `build.js` (build, and `--check`), `diagrams.js` |
| `src/config.js` | reads `docs.config.json`; resolves its paths and the repo-relative paths printed |
| `src/word/` | Markdown → Word: `styles.js` (fonts, colours, sizes, page, list styles), `inline.js` (text runs, links, code spans), `blocks.js` (headings, paragraphs, lists, tables, code, diagrams, the Contents page), `document.js` (the whole document: header, footer, sections), `reproducible.js` (the byte-identical zip) |
| `src/diagrams/` | Mermaid pictures: `files.js` (a diagram's picture name and folder), `render.js` (drawing one picture) |

A new Markdown feature goes in `src/word/blocks.js` or `inline.js`, a new look in `styles.js`, a new command in `src/commands/` with its npm script.

## Documents

Listed in [docs.config.json](docs.config.json); paths are relative to this folder.

| Markdown (source) | Word (generated) |
|---|---|
| `docs/how-it-works/workflows/technical-document.md` | `docs/how-it-works/workflows/documents/technical-document.docx` |
| `docs/how-it-works/workflows/production-deployment.md` | `docs/how-it-works/workflows/documents/production-deployment.docx` |
| `docs/how-it-works/workflows/staging-deployment.md` | `docs/how-it-works/workflows/documents/staging-deployment.docx` |

To add a document, add a `{ "source", "output" }` entry, then run `npm run build`.

## What the Word file looks like

All styling is in `src/word/styles.js`, in one place, so every editor gets the same look:

- A4 page, 2 cm margins, Calibri 10.5 pt body, Consolas for code.
- The first `#` heading is the title; every `##` heading is listed in a **Contents** page before the first section.
- Headings in dark blue; tables with a shaded header row and thin borders; column widths follow how much text each column holds.
- An empty header row (`| | |`) makes a key/value table with no header (the details table under the title).
- Fenced code blocks (including the box-drawing diagrams) in a shaded, bordered block.
- A ` ```mermaid ` block becomes its picture, centred and scaled to fit the page (see below).
- The document title in the page header; "Page X of Y" in the footer.

## Why the output never changes on its own

- **Pinned toolchain.** `package-lock.json` fixes the exact `marked` (18.1.0), `docx` (9.8.1) and `jszip` (3.10.2) versions, and `npm ci` installs exactly those. Don't use `npm install` unless you mean to upgrade.
- **Styling lives in `src/word/styles.js`, not in the Markdown.**
- **No time, machine or random values in the file.** Zip entries are sorted and use one fixed timestamp (`fixedTimestamp` in the config). The document dates are pinned, and the link ids that `docx` generates randomly are renumbered in order of appearance.
- Word draws the arrows `▶` and `◀` as colour emoji, so the Word file uses their plain look-alikes `►` and `◄`; the Markdown keeps what the author typed.

Upgrading a library or changing the styling changes the output of every document. Do it in its own change, rebuild all documents, and commit them together.

## What the Markdown can use

- headings `#`–`####`: the first `#` is the document title, and every `##` appears in the Contents list
- paragraphs with **bold**, *italic*, `code` and links (web links are clickable; repo-relative links become plain text)
- bullet and numbered lists, nested
- tables, with formatting inside cells
- fenced code blocks, including box-drawing diagrams
- ` ```mermaid ` diagrams (flowcharts and the like), drawn as pictures
- `---` rules and `>` quotes

Anything else is written as plain text, never dropped.

## Diagrams

A ` ```mermaid ` block in a document is drawn as a picture.

- **`npm run diagrams`** draws a PNG for each Mermaid block into the document's `documents/diagrams/` folder, with a pinned Mermaid version (`@mermaid-js/mermaid-cli@11.4.2`, through `npx`). It needs Chrome: if Puppeteer can't download its own, set `PUPPETEER_EXECUTABLE_PATH` to a Chrome or Chromium binary.
- **Each picture is named after its diagram's text** (the first 16 hex characters of its SHA-256). A changed diagram gets a new name, so `npm run build` and `npm run check` stop with "A diagram has no image yet … Run: npm run diagrams" until it is redrawn. Pictures no longer used are removed by the same command.
- **The pictures are committed.** The build only reads them, so the `.docx` stays byte-identical on every machine, even though drawing a picture can differ slightly between machines.

