import type { Request, Response } from 'express';

import { ValidationException } from '../../../core/exceptions';
import { created, ok, paginated, uploadedFiles } from '../../../core/http';
import type { IAppTranslationService } from '../contracts/app-translation-service.contract';
import type { AppTranslationInput } from '../dto/language.dto';
import type { AppTranslationStatusCode } from '../types/language.types';
import type { ListTranslationQuery, TranslationParams } from '../validators/language.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const NO_FILE_MESSAGE = 'Choose a CSV file.';

export class AppTranslationController {
    constructor(private readonly service: IAppTranslationService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListTranslationQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.list(
            {
                search: query.search,
                status: query.status as AppTranslationStatusCode | undefined,
                missing: query.missing,
            },
            pagination,
        );
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    languages = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.languages());
    };

    lastPublish = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.lastPublish());
    };

    exportRows = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.exportRows());
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const record = await this.service.create(req.body as AppTranslationInput, signedInUserId(res));
        created(res, record, 'Translation added.');
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params as unknown as TranslationParams;
        ok(res, await this.service.update(id, req.body as AppTranslationInput, signedInUserId(res)), 'Translation updated.');
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params as unknown as TranslationParams;
        ok(res, await this.service.setStatus(id, (req.body as { status: number }).status, signedInUserId(res)));
    };

    upload = async (req: Request, res: Response): Promise<void> => {
        const file = uploadedFiles(req)[0];
        if (!file) throw new ValidationException(NO_FILE_MESSAGE, [{ field: 'file', message: NO_FILE_MESSAGE }]);
        ok(res, await this.service.upload(file.content, signedInUserId(res)));
    };

    publish = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.publish(), 'Translations published.');
    };
}
