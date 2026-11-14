import { randomBytes } from 'node:crypto';

import { NotFoundException } from '../../../core/exceptions';
import { detectImageType, imageContentTypeOf } from '../../../core/validation';
import { type IFileStorage, StoredFileNotFoundError } from '../../../infrastructure/storage';
import type { ParkFeatureImage } from '../dto/park.dto';
import { FEATURE_IMAGE_CONTENT_TYPES, FEATURE_IMAGE_FOLDER } from '../types/park.types';
import { featureImageTypeError, PARK_MESSAGES } from '../validators/park.validators';

const RANDOM_BYTES = 8;

const newFileName = (extension: string): string =>
    `${Date.now()}${randomBytes(RANDOM_BYTES).toString('hex')}.${extension}`;

const featureImagePath = (parkId: number, fileName: string): string =>
    `${FEATURE_IMAGE_FOLDER.PARENT}/${parkId}/${FEATURE_IMAGE_FOLDER.FEATURE}/${fileName}`;

const featureImageNotFound = (): NotFoundException =>
    new NotFoundException(PARK_MESSAGES.IMAGE_NOT_FOUND, 'PARK_IMAGE_NOT_FOUND');

export class ParkImages {
    constructor(private readonly fileStorage: IFileStorage) {}

    async store(parkId: number, content: Buffer): Promise<string> {
        const type = detectImageType(content);
        if (!type || !FEATURE_IMAGE_CONTENT_TYPES.includes(type.contentType)) throw featureImageTypeError();
        const fileName = newFileName(type.extension);
        await this.fileStorage.save(featureImagePath(parkId, fileName), content);
        return fileName;
    }

    async discard(parkId: number, fileName: string): Promise<void> {
        await this.fileStorage.remove(featureImagePath(parkId, fileName)).catch(() => undefined);
    }

    async read(parkId: number, fileName: string | null): Promise<ParkFeatureImage> {
        if (!fileName) throw featureImageNotFound();
        try {
            const content = await this.fileStorage.read(featureImagePath(parkId, fileName));
            return { content, contentType: imageContentTypeOf(fileName) ?? 'application/octet-stream' };
        } catch (error) {
            if (error instanceof StoredFileNotFoundError) throw featureImageNotFound();
            throw error;
        }
    }
}
