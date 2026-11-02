import type { Request, Response } from 'express';

import { created, ok, paginated } from '../../../core/http';
import type { ILanguageService } from '../contracts/language-service.contract';
import type { LanguageInput, NewLanguage } from '../dto/language.dto';
import type { LanguageStatusCode } from '../types/language.types';
import type { LanguageParams, ListLanguageQuery } from '../validators/language.validators';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

export class LanguageController {
    constructor(private readonly service: ILanguageService) {}

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListLanguageQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.list(
            { search: query.search, status: query.status as LanguageStatusCode | undefined },
            pagination,
        );
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    options = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.options());
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const record = await this.service.create(req.body as NewLanguage, signedInUserId(res));
        created(res, record, `"${record.name}" added.`);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const { code } = req.params as unknown as LanguageParams;
        const record = await this.service.update(code, req.body as LanguageInput, signedInUserId(res));
        ok(res, record, `"${record.name}" updated.`);
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { code } = req.params as unknown as LanguageParams;
        ok(res, await this.service.setStatus(code, (req.body as { status: number }).status, signedInUserId(res)));
    };
}
