import type { Request, Response } from 'express';

import { ValidationException } from '../../../core/exceptions';
import { uploadedFiles } from '../../../core/http';
import type { ImageTarget, IncomingImage, SavedSectionDto } from '../dto/package.dto';
import { PackageImageKind, type PackageImageKindKey, PackageVersionStatus } from '../types/package.types';
import { PACKAGE_MESSAGES, type PackageParams, type VersionParams } from '../validators/package.validators';

type SignedInUser = { readonly id: number };

export const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

export const packageIdOf = (req: Request): number => (req.params as unknown as PackageParams).id;

export const versionIdOf = (req: Request): number => (req.params as unknown as VersionParams).versionId;

export const fileNameOf = (req: Request): string => (req.params as unknown as { fileName: string }).fileName;

export const imageTargetOf = (req: Request): ImageTarget => {
    const params = req.params as unknown as { kind?: PackageImageKindKey; dayNumber?: number };
    if (params.dayNumber !== undefined) return { dayNumber: params.dayNumber };
    return { kind: params.kind ?? PackageImageKind.PACKAGE };
};

export const uploadedImageOf = (req: Request): IncomingImage => {
    const file = uploadedFiles(req)[0];
    if (!file) {
        const message = PACKAGE_MESSAGES.IMAGE_MISSING;
        throw new ValidationException(message, [{ field: 'image', message }], 'PACKAGE_IMAGE_MISSING');
    }
    return { originalName: file.originalName, content: file.content };
};

const MEALS_NOTE = ' Breakfast, lunch and dinner are ticked on every day.';

export const sectionMessage = (saved: SavedSectionDto, byAdmin: boolean): string => {
    const base =
        byAdmin && saved.version.status === PackageVersionStatus.LIVE ? 'Saved. The website shows the change now.' : 'Section saved.';
    return saved.mealsTicked ? `${base}${MEALS_NOTE}` : base;
};
