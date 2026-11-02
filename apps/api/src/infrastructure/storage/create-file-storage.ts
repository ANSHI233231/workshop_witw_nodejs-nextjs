import { LocalDiskFileStorage } from './providers/local-disk.provider';
import type { IFileStorage } from './storage.contract';

export const STORAGE_DRIVERS = ['local'] as const;

export type StorageDriver = (typeof STORAGE_DRIVERS)[number];

export const createFileStorage = (options: {
    readonly driver: StorageDriver;
    readonly localRoot: string;
}): IFileStorage => {
    switch (options.driver) {
        case 'local':
            return new LocalDiskFileStorage(options.localRoot);
    }
};
