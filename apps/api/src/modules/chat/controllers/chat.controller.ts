import type { Request, Response } from 'express';

import { created, ok, openEventStream } from '../../../core/http';
import type { IChatService } from '../contracts/chat-service.contract';
import { CHAT_MESSAGES, type IdParams, type SendMessageBody } from '../validators/chat.validators';

const signedInUserId = (res: Response): number => (res.locals['authUser'] as { readonly id: number }).id;

const idOf = (req: Request): number => (req.params as unknown as IdParams).id;

export class ChatController {
    constructor(private readonly service: IChatService) {}

    conversations = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.conversations(signedInUserId(res)));
    };

    conversation = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.conversation(signedInUserId(res), idOf(req)));
    };

    markRead = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.markRead(signedInUserId(res), idOf(req)));
    };

    withUser = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.withUser(signedInUserId(res), idOf(req)));
    };

    send = async (req: Request, res: Response): Promise<void> => {
        created(res, await this.service.send(signedInUserId(res), req.body as SendMessageBody), CHAT_MESSAGES.SENT);
    };

    unreadCount = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.unreadCount(signedInUserId(res)));
    };

    stream = async (_req: Request, res: Response): Promise<void> => {
        const userId = signedInUserId(res);
        const start = await this.service.openStream(userId);
        this.service.attachStream(userId, openEventStream(res), start);
    };
}
