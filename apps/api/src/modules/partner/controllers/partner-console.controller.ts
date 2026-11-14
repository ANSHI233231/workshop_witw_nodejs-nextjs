import type { Request, Response } from 'express';

import { ok, paginated, sendInline } from '../../../core/http';
import type { IPartnerConsoleService } from '../contracts/partner-console-service.contract';
import type { BusinessDetails, PartnerPage } from '../dto/partner.dto';
import { PartnerStatus, type PartnerStatusCode } from '../types/partner.types';
import type { PartnerListQuery, PartnerParams } from '../validators/partner.validators';
import { logoContentOf } from './partner-request.controller';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const idOf = (req: Request): number => (req.params as unknown as PartnerParams).id;

const listQueryOf = (req: Request) => {
    const query = req.query as unknown as PartnerListQuery;
    return { filters: { search: query.search, status: query.status }, pagination: { page: query.page, limit: query.limit } };
};

const sendPage = (res: Response, page: PartnerPage, pagination: { page: number; limit: number }): void => {
    paginated(res, page.items, { ...pagination, total: page.total });
};

export class PartnerConsoleController {
    constructor(private readonly service: IPartnerConsoleService) {}

    listRequests = async (req: Request, res: Response): Promise<void> => {
        const { filters, pagination } = listQueryOf(req);
        sendPage(res, await this.service.listRequests(filters, pagination), pagination);
    };

    requestDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.requestDetail(idOf(req)));
    };

    approve = async (req: Request, res: Response): Promise<void> => {
        const partner = await this.service.approve(idOf(req), signedInUserId(res));
        ok(res, partner, `${partner.businessName} is now a partner.`);
    };

    reject = async (req: Request, res: Response): Promise<void> => {
        const { reason } = req.body as { readonly reason: string };
        const partner = await this.service.reject(idOf(req), reason, signedInUserId(res));
        ok(res, partner, `Request rejected. ${partner.ownerName} sees the reason.`);
    };

    listPartners = async (req: Request, res: Response): Promise<void> => {
        const { filters, pagination } = listQueryOf(req);
        sendPage(res, await this.service.listPartners(filters, pagination), pagination);
    };

    partnerDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.partnerDetail(idOf(req)));
    };

    edit = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.edit(idOf(req), req.body as BusinessDetails, signedInUserId(res)), 'Partner details saved.');
    };

    logo = async (req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.service.logo(idOf(req))), isPublic: false });
    };

    setLogo = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.setLogo(idOf(req), logoContentOf(req), signedInUserId(res)), 'Logo saved.');
    };

    removeLogo = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.removeLogo(idOf(req), signedInUserId(res)), 'Logo removed.');
    };

    setPhoneShown = async (req: Request, res: Response): Promise<void> => {
        const { isPhoneShown } = req.body as { readonly isPhoneShown: boolean };
        const partner = await this.service.setPhoneShown(idOf(req), isPhoneShown, signedInUserId(res));
        const message = isPhoneShown
            ? `${partner.businessName} now sees phone numbers in quote requests.`
            : `${partner.businessName} no longer sees phone numbers.`;
        ok(res, partner, message);
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const { status } = req.body as { readonly status: PartnerStatusCode };
        const partner = await this.service.setStatus(idOf(req), status, signedInUserId(res));
        const message =
            status === PartnerStatus.ACTIVE
                ? `${partner.businessName} is active again.`
                : `${partner.businessName} is deactivated.`;
        ok(res, partner, message);
    };
}
