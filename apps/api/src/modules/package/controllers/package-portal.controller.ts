import type { Request, Response } from 'express';

import { created, ok, sendInline } from '../../../core/http';
import type { IPackagePortalService } from '../contracts/package-portal-service.contract';
import type {
    BasicSection,
    FaqsSection,
    GettingThereSection,
    InclusionsSection,
    ItinerarySection,
    PortalListFilters,
} from '../dto/package.dto';
import { PackageWebsiteStatus, type PackageWebsiteStatusCode } from '../types/package.types';
import {
    fileNameOf,
    imageTargetOf,
    packageIdOf,
    sectionMessage,
    signedInUserId,
    uploadedImageOf,
    versionIdOf,
} from './request-values';

export class PackagePortalController {
    constructor(private readonly service: IPackagePortalService) {}

    dashboard = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.dashboard(signedInUserId(res)));
    };

    list = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.list(signedInUserId(res), req.query as unknown as PortalListFilters));
    };

    formOptions = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.formOptions(signedInUserId(res)));
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const view = await this.service.create(signedInUserId(res), req.body as BasicSection);
        created(res, view, 'Basic saved. Version 1 is a draft; the other sections are open now.');
    };

    detail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.detail(signedInUserId(res), packageIdOf(req)));
    };

    version = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.version(signedInUserId(res), packageIdOf(req), versionIdOf(req)));
    };

    saveBasic = async (req: Request, res: Response): Promise<void> => {
        const saved = await this.service.saveBasic(signedInUserId(res), packageIdOf(req), versionIdOf(req), req.body as BasicSection);
        ok(res, saved, sectionMessage(saved, false));
    };

    saveItinerary = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as ItinerarySection;
        const saved = await this.service.saveItinerary(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, false));
    };

    saveInclusions = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as InclusionsSection;
        const saved = await this.service.saveInclusions(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, false));
    };

    saveGettingThere = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as GettingThereSection;
        const saved = await this.service.saveGettingThere(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, false));
    };

    saveFaqs = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as FaqsSection;
        const saved = await this.service.saveFaqs(signedInUserId(res), packageIdOf(req), versionIdOf(req), body);
        ok(res, saved, sectionMessage(saved, false));
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

    startEdit = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.startEdit(signedInUserId(res), packageIdOf(req)), 'A new draft is made from the live version.');
    };

    send = async (req: Request, res: Response): Promise<void> => {
        const view = await this.service.send(signedInUserId(res), packageIdOf(req), versionIdOf(req));
        ok(res, view, `Version ${view.version.versionNumber} sent for approval.`);
    };

    deleteWorking = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.deleteWorking(signedInUserId(res), packageIdOf(req), versionIdOf(req)), 'Draft discarded.');
    };

    setWebsiteStatus = async (req: Request, res: Response): Promise<void> => {
        const status = (req.body as { websiteStatus: PackageWebsiteStatusCode }).websiteStatus;
        const item = await this.service.setWebsiteStatus(signedInUserId(res), packageIdOf(req), status);
        const state = status === PackageWebsiteStatus.ACTIVE ? 'active' : 'inactive';
        ok(res, item, `${item.name} is now ${state} on the website.`);
    };

    file = async (req: Request, res: Response): Promise<void> => {
        const file = await this.service.file(signedInUserId(res), packageIdOf(req), versionIdOf(req), fileNameOf(req));
        sendInline(res, { ...file, isPublic: false });
    };
}
