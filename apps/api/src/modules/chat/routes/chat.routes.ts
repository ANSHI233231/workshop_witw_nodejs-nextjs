import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { ChatController } from '../controllers/chat.controller';
import { conversationIdSchema, sendMessageSchema, userIdSchema } from '../validators/chat.validators';

export const createChatRouter = (controller: ChatController, signedIn: AccessGuard): ApiRouter => {
    const route = apiRouter();

    route.get('/stream', signedIn, asyncHandler(controller.stream));
    route.get('/unread-count', signedIn, asyncHandler(controller.unreadCount));
    route.get('/conversations', signedIn, asyncHandler(controller.conversations));
    route.get('/conversations/:id', signedIn, validate(conversationIdSchema), asyncHandler(controller.conversation));
    route.post('/conversations/:id/read', signedIn, validate(conversationIdSchema), asyncHandler(controller.markRead));
    route.get('/users/:id', signedIn, validate(userIdSchema), asyncHandler(controller.withUser));
    route.post('/messages', signedIn, validate(sendMessageSchema), asyncHandler(controller.send));

    return route;
};
