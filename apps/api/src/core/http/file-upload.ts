import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';

import { ValidationException } from '../exceptions';

export type UploadedFile = {
    readonly originalName: string;
    readonly content: Buffer;
    readonly size: number;
};

export type FileUploadOptions = {
    readonly field: string;
    readonly maxFiles: number;
    readonly maxFileBytes: number;
    readonly tooLargeMessage?: string;
};

const EXTRA_FORM_FIELDS = 10;

const BYTES_PER_MB = 1024 * 1024;

const limitMessage = (error: multer.MulterError, options: FileUploadOptions): string => {
    switch (error.code) {
        case 'LIMIT_FILE_SIZE':
            return (
                options.tooLargeMessage ??
                `Each file can be at most ${Math.floor(options.maxFileBytes / BYTES_PER_MB)} MB.`
            );
        case 'LIMIT_FILE_COUNT':
            return `You can upload at most ${options.maxFiles} files at a time.`;
        case 'LIMIT_UNEXPECTED_FILE':
            return error.field === options.field
                ? `You can upload at most ${options.maxFiles} files at a time.`
                : 'Send the files in the expected field.';
        default:
            return 'The upload could not be read.';
    }
};

export const fileUpload = (options: FileUploadOptions): RequestHandler => {
    const reader = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: options.maxFileBytes,
            files: options.maxFiles,
            fields: EXTRA_FORM_FIELDS,
            parts: options.maxFiles + EXTRA_FORM_FIELDS,
        },
    }).array(options.field, options.maxFiles);

    return (req: Request, res: Response, next: NextFunction): void => {
        reader(req, res, (error: unknown) => {
            if (error instanceof multer.MulterError) {
                const message = limitMessage(error, options);
                next(new ValidationException(message, [{ field: options.field, message }], 'UPLOAD_REJECTED'));
                return;
            }
            next(error);
        });
    };
};

export const uploadedFiles = (req: Request): UploadedFile[] => {
    const files = Array.isArray(req.files) ? req.files : [];
    return files.map((file) => ({ originalName: file.originalname, content: file.buffer, size: file.size }));
};
