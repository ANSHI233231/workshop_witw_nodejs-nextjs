import { randomBytes } from 'node:crypto';

import { NotFoundException, ValidationException } from '../../../core/exceptions';
import { detectImageType, imageContentTypeOf } from '../../../core/validation';
import { type IFileStorage, StoredFileNotFoundError } from '../../../infrastructure/storage';
import type { ProfileImage } from '../dto/profile.dto';
import { PROFILE_FOLDER, PROFILE_IMAGE_TYPES, type ProfileImageKindCode } from '../types/profile.types';
import { PROFILE_MESSAGES } from '../validators/profile.validators';

const RANDOM_BYTES = 8;

const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

export const profileFolder = (userId: number): string => `${PROFILE_FOLDER}/${userId}`;

const pathOf = (userId: number, kind: ProfileImageKindCode, fileName: string): string =>
    `${profileFolder(userId)}/${kind}/${fileName}`;

export const imageTypeRefused = (kind: ProfileImageKindCode): ValidationException =>
    new ValidationException(
        PROFILE_MESSAGES.IMAGE_TYPE,
        [{ field: kind === 'photo' ? 'photo' : 'coverPhoto', message: PROFILE_MESSAGES.IMAGE_TYPE }],
        'PROFILE_IMAGE_TYPE',
    );

export const noImage = (): NotFoundException => new NotFoundException(PROFILE_MESSAGES.NO_PHOTO, 'PROFILE_IMAGE_NOT_FOUND');

export class ProfileFiles {
    constructor(private readonly fileStorage: IFileStorage) {}

    async store(userId: number, kind: ProfileImageKindCode, content: Buffer): Promise<string> {
        const type = detectImageType(content);
        if (!type || !PROFILE_IMAGE_TYPES.includes(type.contentType)) throw imageTypeRefused(kind);
        const fileName = newFileName(type.extension);
        await this.fileStorage.save(pathOf(userId, kind, fileName), content);
        return fileName;
    }

    async discard(userId: number, kind: ProfileImageKindCode, fileName: string | null): Promise<void> {
        if (!fileName) return;
        await this.fileStorage.remove(pathOf(userId, kind, fileName)).catch(() => undefined);
    }

    async read(userId: number, kind: ProfileImageKindCode, fileName: string | null): Promise<ProfileImage> {
        if (!fileName) throw noImage();
        try {
            const content = await this.fileStorage.read(pathOf(userId, kind, fileName));
            return { content, contentType: imageContentTypeOf(fileName) ?? 'application/octet-stream' };
        } catch (error) {
            if (error instanceof StoredFileNotFoundError) throw noImage();
            throw error;
        }
    }

    async removeFolderAt(folder: string): Promise<void> {
        await this.fileStorage.removeFolder(folder).catch(() => undefined);
    }
}
