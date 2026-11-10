import type { CommentInput, FlagInput } from '../dto/shared-safari.dto';

type SignedIn = { readonly id: number };

export interface IDiscussionService {
    post(safariId: number, input: CommentInput, viewer: SignedIn): Promise<{ id: number }>;
    edit(commentId: number, text: string, viewer: SignedIn): Promise<void>;
    remove(commentId: number, viewer: SignedIn): Promise<void>;
    flag(commentId: number, input: FlagInput, viewer: SignedIn): Promise<void>;
}
