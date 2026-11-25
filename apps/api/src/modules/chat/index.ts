import type { AccessGuard } from '../../core/http';

import type { ChatModuleDependencies, ChatTestDataModuleDependencies } from './contracts/chat-module.contract';
import type { IChatService } from './contracts/chat-service.contract';
import type { IChatTestDataService } from './contracts/chat-test-data-service.contract';
import { ChatController } from './controllers/chat.controller';
import { ChatTestDataRepository } from './repositories/chat-test-data.repository';
import { ChatRepository } from './repositories/chat.repository';
import { createChatRouter } from './routes/chat.routes';
import { ChatStreams } from './services/chat-streams';
import { ChatTestDataService } from './services/chat-test-data.service';
import { ChatService } from './services/chat.service';

export type { ChatModuleDependencies } from './contracts/chat-module.contract';
export type { IChatService } from './contracts/chat-service.contract';

export const createChatModule = (dependencies: ChatModuleDependencies) => {
    const chatService: IChatService = new ChatService(
        dependencies.db,
        new ChatRepository(),
        dependencies.auditService,
        dependencies.usersService,
        dependencies.partnerService,
        dependencies.notificationService,
        new ChatStreams(),
    );
    const controller = new ChatController(chatService);
    return {
        chatService,
        createRouter: (signedIn: AccessGuard) => createChatRouter(controller, signedIn),
    };
};

export type { IChatTestDataService } from './contracts/chat-test-data-service.contract';
export type { ChatTestData } from './dto/chat-test-data.dto';

export const createChatTestDataModule = (dependencies: ChatTestDataModuleDependencies) => {
    const chatTestDataService: IChatTestDataService = new ChatTestDataService(
        dependencies.db,
        new ChatTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { chatTestDataService };
};
