export type ImageType = { readonly contentType: string; readonly extension: string };

const startsWith = (content: Buffer, bytes: readonly number[], offset = 0): boolean =>
    content.length >= offset + bytes.length && bytes.every((byte, index) => content[offset + index] === byte);

const asciiBytes = (text: string): number[] => Array.from(text, (character) => character.charCodeAt(0));

export const detectImageType = (content: Buffer): ImageType | undefined => {
    if (startsWith(content, [0xff, 0xd8, 0xff])) return { contentType: 'image/jpeg', extension: 'jpg' };
    if (startsWith(content, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return { contentType: 'image/png', extension: 'png' };
    }
    if (startsWith(content, asciiBytes('GIF87a')) || startsWith(content, asciiBytes('GIF89a'))) {
        return { contentType: 'image/gif', extension: 'gif' };
    }
    if (startsWith(content, asciiBytes('RIFF')) && startsWith(content, asciiBytes('WEBP'), 8)) {
        return { contentType: 'image/webp', extension: 'webp' };
    }
    return undefined;
};

const CONTENT_TYPE_OF_EXTENSION: Readonly<Record<string, string>> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
};

export const imageContentTypeOf = (fileName: string): string | undefined =>
    CONTENT_TYPE_OF_EXTENSION[fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()];
