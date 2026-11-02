export interface IFileStorage {
    save(path: string, content: Buffer): Promise<void>;
    read(path: string): Promise<Buffer>;
    remove(path: string): Promise<void>;
}

export class StoredFileNotFoundError extends Error {
    constructor(public readonly path: string) {
        super(`Stored file not found: ${path}`);
        this.name = 'StoredFileNotFoundError';
    }
}

export class InvalidStoragePathError extends Error {
    constructor(public readonly path: string) {
        super(`Invalid storage path: ${path}`);
        this.name = 'InvalidStoragePathError';
    }
}
