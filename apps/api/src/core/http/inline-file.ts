import type { Response } from 'express';

export type InlineFile = {
    readonly content: Buffer;
    readonly contentType: string;
    readonly isPublic: boolean;
};

const ONE_DAY_SECONDS = 86_400;

export const sendInline = (res: Response, file: InlineFile): void => {
    res.status(200)
        .type(file.contentType)
        .set({
            'Cache-Control': `${file.isPublic ? 'public' : 'private'}, max-age=${ONE_DAY_SECONDS}`,
            'Content-Disposition': 'inline',
            'Content-Length': String(file.content.length),
        })
        .send(file.content);
};
