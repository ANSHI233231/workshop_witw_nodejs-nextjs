import type { Response } from 'express';

export type DownloadFile = {
    readonly name: string;
    readonly path: string;
    readonly sizeBytes: number;
    readonly contentType?: string;
};

export const sendDownload = (res: Response, file: DownloadFile): void => {
    res.status(200)
        .type(file.contentType ?? 'text/plain')
        .set({
            'Cache-Control': 'private, no-store',
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': String(file.sizeBytes),
        })
        .sendFile(file.path);
};
