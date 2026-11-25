import { z } from 'zod';

import { CHAT_LIMITS } from '../types/chat.types';

export const CHAT_MESSAGES = {
    MESSAGE_EMPTY: 'Type a message.',
    MESSAGE_TOO_LONG: 'Use up to 1,000 characters.',
    RECIPIENT_DEACTIVATED: "This account is deactivated. Your message can't be sent.",
    RECIPIENT_NOT_FOUND: 'This user was not found.',
    RECIPIENT_PARTNER: "Partners don't use Messages, so your message can't be sent.",
    SELF: "You can't send a message to yourself.",
    PARTNER: "Partners don't use Messages.",
    CONVERSATION_NOT_FOUND: 'This conversation was not found.',
    ACCOUNT_NOT_FOUND: 'Your account was not found.',
    SENT: 'Your message is sent.',
} as const;

const positiveId = (message: string) =>
    z.coerce.number({ required_error: message, invalid_type_error: message }).int(message).positive(message);

const messageText = z.unknown().transform((value, context): string => {
    const text = typeof value === 'string' ? value.trim() : '';
    const problem =
        text.length === 0
            ? CHAT_MESSAGES.MESSAGE_EMPTY
            : text.length > CHAT_LIMITS.MESSAGE_MAX
              ? CHAT_MESSAGES.MESSAGE_TOO_LONG
              : undefined;
    if (problem) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: problem });
        return z.NEVER;
    }
    return text;
});

export const sendMessageSchema = z.object({
    body: z
        .object({
            recipientUserId: z
                .number({
                    required_error: CHAT_MESSAGES.RECIPIENT_NOT_FOUND,
                    invalid_type_error: CHAT_MESSAGES.RECIPIENT_NOT_FOUND,
                })
                .int(CHAT_MESSAGES.RECIPIENT_NOT_FOUND)
                .positive(CHAT_MESSAGES.RECIPIENT_NOT_FOUND),
            text: messageText,
        })
        .strict(),
});

export type SendMessageBody = z.infer<typeof sendMessageSchema>['body'];

export type IdParams = { readonly id: number };

export const conversationIdSchema = z.object({
    params: z.object({ id: positiveId(CHAT_MESSAGES.CONVERSATION_NOT_FOUND) }),
});

export const userIdSchema = z.object({ params: z.object({ id: positiveId(CHAT_MESSAGES.RECIPIENT_NOT_FOUND) }) });
