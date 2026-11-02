import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import { type IFileStorage, InvalidStoragePathError, StoredFileNotFoundError } from '../storage.contract';

const isMissing = (error: unknown): boolean =>
    error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT';

export class LocalDiskFileStorage implements IFileStorage {
    private readonly root: string;

    constructor(root: string) {
        this.root = resolve(root);
    }

    async save(path: string, content: Buffer): Promise<void> {
        const target = this.locate(path);
        await mkdir(dirname(target), { recursive: true });
        const partial = `${target}.${randomBytes(6).toString('hex')}.partial`;
        try {
            await writeFile(partial, content, { flag: 'wx' });
            await rename(partial, target);
        } catch (error) {
            await rm(partial, { force: true });
            throw error;
        }
    }

    async read(path: string): Promise<Buffer> {
        try {
            return await readFile(this.locate(path));
        } catch (error) {
            if (isMissing(error)) throw new StoredFileNotFoundError(path);
            throw error;
        }
    }

    async remove(path: string): Promise<void> {
        try {
            await unlink(this.locate(path));
        } catch (error) {
            if (!isMissing(error)) throw error;
        }
    }

    private locate(path: string): string {
        if (path.length === 0 || isAbsolute(path) || path.includes('\\') || path.includes('\0')) {
            throw new InvalidStoragePathError(path);
        }
        const target = resolve(this.root, path);
        const inside = relative(this.root, target);
        if (inside.length === 0 || inside.startsWith('..') || isAbsolute(inside)) {
            throw new InvalidStoragePathError(path);
        }
        return target;
    }
}
