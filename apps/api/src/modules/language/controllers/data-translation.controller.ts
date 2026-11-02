import type { Request, Response } from 'express';

import { ok } from '../../../core/http';
import type { IDataTranslationService } from '../contracts/data-translation-service.contract';

export class DataTranslationController {
    constructor(private readonly service: IDataTranslationService) {}

    languages = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.languages());
    };
}
