import fs from 'node:fs';
import path from 'node:path';

export type CatalogArgument = { readonly name: string; readonly optional: boolean };

export type CatalogCommand = {
    readonly command: string;
    readonly arguments: readonly CatalogArgument[];
    readonly description: string;
};

const CONTROLLER_FILE = /Controller\.(ts|js)$/;

const ACTION =
    /(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?(?:public\s+)?(?:async\s+)?action([A-Z][A-Za-z0-9]*)\s*\(([^)]*)\)/g;

const kebab = (text: string): string => text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const firstLine = (comment: string | undefined): string =>
    (comment ?? '')
        .split('\n')
        .map((line) =>
            line
                .trim()
                .replace(/^\*\s?/, '')
                .trim(),
        )
        .find((line) => line.length > 0 && !line.startsWith('@')) ?? '';

const argumentsOf = (signature: string, compiled: boolean): CatalogArgument[] =>
    signature
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [beforeDefault = ''] = part.split('=');
            const name = beforeDefault.split(':')[0]?.replace('?', '').trim() ?? '';
            return { name, optional: compiled || part.includes('?') || part.includes('=') };
        })
        .filter((argument) => argument.name.length > 0);

const commandsOf = (filePath: string): CatalogCommand[] => {
    const controllerId = kebab(path.basename(filePath).replace(CONTROLLER_FILE, ''));
    const source = fs.readFileSync(filePath, 'utf8');
    return [...source.matchAll(ACTION)].map((match) => ({
        command: `${controllerId}/${kebab(match[2] ?? '')}`,
        arguments: argumentsOf(match[3] ?? '', filePath.endsWith('.js')),
        description: firstLine(match[1]),
    }));
};

export const commandCatalog = (controllersPath: string): CatalogCommand[] =>
    (fs.readdirSync(controllersPath, { recursive: true }) as string[])
        .filter((file) => CONTROLLER_FILE.test(file) && !file.endsWith('.d.ts'))
        .flatMap((file) => commandsOf(path.join(controllersPath, file)))
        .sort((left, right) => left.command.localeCompare(right.command));
