import type { ChatTestData } from '../dto/chat-test-data.dto';

export interface IChatTestDataService {
    find(userIds: readonly number[]): Promise<ChatTestData>;
    remove(found: ChatTestData): Promise<number>;
}
