const PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g;

const HTML_ESCAPES: Readonly<Record<string, string>> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const escapeHtml = (text: string): string =>
    text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);

export const renderText = (template: string, variables: Readonly<Record<string, string>>): string =>
    template.replace(PLACEHOLDER, (_match, name: string) => variables[name] ?? '');

export const renderHtml = (template: string, variables: Readonly<Record<string, string>>): string =>
    template.replace(PLACEHOLDER, (_match, name: string) => escapeHtml(variables[name] ?? ''));
