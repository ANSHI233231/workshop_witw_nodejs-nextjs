import type { Request, Response } from 'express';

import { created, ok, paginated, sendInline } from '../../../core/http';
import type { PaginationQuery } from '../../../core/validation';
import type { IDeleteReasonService } from '../contracts/delete-reason-service.contract';
import type { IPackageConsoleService } from '../contracts/package-console-service.contract';
import type {
    AdminDeleteInput,
    BasicSection,
    ConsoleListFilters,
    DeleteReasonFilters,
    DeleteReasonInput,
    FaqsSection,
    GettingThereSection,
    InclusionsSection,
    ItinerarySection,
} from '../dto/package.dto';
import { DeleteReasonStatus, type DeleteReasonStatusCode } from '../types/package.types';
import type { ReasonParams } from '../validators/package.validators';
import {
    fileNameOf,
    imageTargetOf,
    packageIdOf,
    sectionMessage,
    signedInUserId,
    uploadedImageOf,
    versionIdOf,
} from './request-values';

const pageOf = (query: PaginationQuery): PaginationQuery => ({ page: query.page, limit: query.limit });

const reasonIdOf = (req: Request): number => (req.params as unknown as ReasonParams).id;

export class PackageConsoleController {
    constructor(
        private readonly service: IPackageConsoleService,
        private readonly reasons: IDeleteReasonService,
    ) {}

    approvals = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as PaginationQuery & { search?: string };
        const result = await this.service.approvals(query.search, pageOf(query));
        paginated(res, result.items, { ...pageOf(query), total: result.total });
    };

    list = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as PaginationQuery & ConsoleListFilters;
        const result = await this.service.list(
            { search: query.search, websiteStatus: query.websiteStatus, partnerId: query.partnerId },
            pageOf(query),
        );
        paginated(res, result.items, { ...pageOf(query), total: result.total });
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(packageIdOf(req)));
    };

    version = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.version(packageIdOf(req), versionIdOf(req)));
    };

    formOptions = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.formOptions(packageIdOf(req)));
    };

    saveBasic = async (req: Request, res: Response): Promise<void> => {
        const saved = await this.service.saveBasic(signedInUserId(res), packageIdOf(req), versionIdOf(req), req.body as BasicSection);
        ok(res, saved, sectionMessage(saved, true));
    };

    saveItinerary = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as ItinerarySection;
        const saved = await this.service.saveItinerary(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, true));
    };

    saveInclusions = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as InclusionsSection;
        const saved = await this.service.saveInclusions(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, true));
    };

    saveGettingThere = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as GettingThereSection;
        const saved = await this.service.saveGettingThere(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, true));
    };

    saveFaqs = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as FaqsSection;
        const saved = await this.service.saveFaqs(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, true));
    };

    setImage = async (req: Request, res: Response): Promise<void> => {
        const image = uploadedImageOf(req);
        const saved = await this.service.setImage(signedInUserId(res), packageIdOf(req), versionIdOf(req), imageTargetOf(req), image);
        ok(res, saved, 'Image saved.');
    };

    removeImage = async (req: Request, res: Response): Promise<void> => {
        const saved = await this.service.setImage(signedInUserId(res), packageIdOf(req), versionIdOf(req), imageTargetOf(req), null);
        ok(res, saved, 'Image removed.');
    };

    approve = async (req: Request, res: Response): Promise<void> => {
        const view = await this.service.approve(signedInUserId(res), packageIdOf(req), versionIdOf(req));
        ok(res, view, `${view.version.name} v${view.version.versionNumber} is live on the website.`);
    };

    reject = async (req: Request, res: Response): Promise<void> => {
        const reason = (req.body as { reason: string }).reason;
        const view = await this.service.reject(signedInUserId(res), packageIdOf(req), versionIdOf(req), reason);
        ok(res, view, `Version ${view.version.versionNumber} rejected. The partner sees the reason.`);
    };

    remove = async (req: Request, res: Response): Promise<void> => {
        const summary = await this.service.remove(signedInUserId(res), packageIdOf(req), req.body as AdminDeleteInput);
        ok(res, summary, 'Package deleted from the website.');
    };

    setPopular = async (req: Request, res: Response): Promise<void> => {
        const on = (req.body as { on: boolean }).on;
        const summary = await this.service.setPopular(signedInUserId(res), packageIdOf(req), on);
        ok(res, summary, on ? 'The package is marked Popular.' : 'The package is no longer Popular.');
    };

    setBestDeal = async (req: Request, res: Response): Promise<void> => {
        const on = (req.body as { on: boolean }).on;
        const summary = await this.service.setBestDeal(signedInUserId(res), packageIdOf(req), on);
        ok(res, summary, on ? 'The package shows the Best deal badge.' : 'The package no longer shows Best deal.');
    };

    file = async (req: Request, res: Response): Promise<void> => {
        const file = await this.service.file(packageIdOf(req), versionIdOf(req), fileNameOf(req));
        sendInline(res, { ...file, isPublic: false });
    };

    reasonList = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as PaginationQuery & DeleteReasonFilters;
        const result = await this.reasons.list({ search: query.search, status: query.status }, pageOf(query));
        paginated(res, result.items, { ...pageOf(query), total: result.total });
    };

    reasonActive = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.reasons.active());
    };

    reasonAdd = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.reasons.add(signedInUserId(res), (req.body as { name: string }).name), 'Reason added.');
    };

    reasonUpdate = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.reasons.update(signedInUserId(res), reasonIdOf(req), req.body as DeleteReasonInput), 'Reason updated.');
    };

    reasonStatus = async (req: Request, res: Response): Promise<void> => {
        const status = (req.body as { status: DeleteReasonStatusCode }).status;
        const reason = await this.reasons.setStatus(signedInUserId(res), reasonIdOf(req), status);
        const state = status === DeleteReasonStatus.ACTIVE ? 'active' : 'inactive';
        ok(res, reason, `Reason "${reason.name}" is now ${state}.`);
    };
}
