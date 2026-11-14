import type { Request, Response } from 'express';

import { created, ok, sendInline, uploadedFiles } from '../../../core/http';
import type { PartnerSessionCookies } from '../contracts/partner-module.contract';
import type { IPartnerRequestService } from '../contracts/partner-request-service.contract';
import type { BusinessDetails } from '../dto/partner.dto';
import type { PartnerParams, SendWithAccountBody } from '../validators/partner.validators';
import { PARTNER_MESSAGES } from '../validators/partner.validators';
import { ValidationException } from '../../../core/exceptions';

type SignedInUser = { readonly id: number };

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const REQUEST_SENT = 'Your partner request is sent.';

const logoMissing = (): ValidationException =>
    new ValidationException(PARTNER_MESSAGES.LOGO_TYPE, [{ field: 'logo', message: PARTNER_MESSAGES.LOGO_TYPE }], 'PARTNER_LOGO_TYPE');

export const logoContentOf = (req: Request): Buffer => {
    const file = uploadedFiles(req)[0];
    if (!file) throw logoMissing();
    return file.content;
};

const businessOf = (body: SendWithAccountBody): BusinessDetails => ({
    businessName: body.businessName,
    ownerName: body.ownerName,
    businessPhone: body.businessPhone,
    businessEmail: body.businessEmail,
    about: body.about,
    masterParkIds: body.masterParkIds,
});

export class PartnerRequestController {
    constructor(
        private readonly service: IPartnerRequestService,
        private readonly sessionCookies: PartnerSessionCookies,
    ) {}

    mine = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.mine(signedInUserId(res)));
    };

    send = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.service.send(signedInUserId(res), req.body as BusinessDetails), REQUEST_SENT);
    };

    sendWithAccount = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as SendWithAccountBody;
        const account = { name: body.name, email: body.email, mobile: body.mobile, password: body.password };
        const { session, request } = await this.service.sendWithAccount(account, businessOf(body));
        this.sessionCookies.write(res, session);
        created(res, { user: session.user, request }, 'Your account is created and your partner request is sent.');
    };

    sendAgain = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.sendAgain(signedInUserId(res), req.body as BusinessDetails), REQUEST_SENT);
    };

    logo = async (_req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.service.myLogo(signedInUserId(res))), isPublic: false });
    };

    partnerLogo = async (req: Request, res: Response): Promise<void> => {
        sendInline(res, { ...(await this.service.partnerLogo((req.params as unknown as PartnerParams).id)), isPublic: true });
    };

    setLogo = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.setMyLogo(signedInUserId(res), logoContentOf(req)), 'Logo saved.');
    };

    removeLogo = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.removeMyLogo(signedInUserId(res)), 'Logo removed.');
    };
}
