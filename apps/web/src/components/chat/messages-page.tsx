'use client';

import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { useChat } from '@/components/chat/chat-provider';
import { userProfilePath } from '@/components/profile/person-link';
import { UserAvatar } from '@/components/profile/user-avatar';
import { SiteToast } from '@/components/shared-safari/site-toast';
import { useT } from '@/hooks/i18n/use-t';
import { useSiteToast } from '@/hooks/shared-safari/use-site-toast';
import { cn } from '@/lib/class-names';
import { messageStamp } from '@/lib/chat-format';
import { logger } from '@/lib/logger';
import { ApiError } from '@/services/api-error';
import {
    getChatPartner,
    getConversation,
    listConversations,
    markConversationRead,
    sendMessage,
} from '@/services/chat.service';
import { CHAT_LIMITS, type ChatMessage, type ChatUser, type Conversation, type SentMessage } from '@/types/chat.types';

const log = logger.category('chat');

type Open = { readonly conversationId: number | null; readonly user: ChatUser };

const initialsOf = (name: string): string =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || '?';

const byLatest = (a: Conversation, b: Conversation): number =>
    new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime();

const withConversation = (list: readonly Conversation[], next: Conversation): readonly Conversation[] =>
    [...list.filter((item) => item.id !== next.id), next].sort(byLatest);

export function MessagesPage({ withUserId }: { readonly withUserId: number | null }) {
    const t = useT();
    const { setUnreadCount, listen } = useChat();
    const { toast, showError, hide } = useSiteToast();
    const [conversations, setConversations] = useState<readonly Conversation[] | null>(null);
    const [open, setOpen] = useState<Open | null>(null);
    const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [draftError, setDraftError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const openRef = useRef<Open | null>(null);
    const bottom = useRef<HTMLDivElement>(null);

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    const failed = useCallback(
        (error: unknown) => {
            log.error('Messages could not be loaded.', { error });
            showError(error instanceof ApiError ? t(error.message) : t('This could not be done. Please try again.'));
        },
        [showError, t],
    );

    const readOpen = useCallback(
        async (conversationId: number) => {
            try {
                const { unreadCount } = await markConversationRead(conversationId);
                setUnreadCount(unreadCount);
                setConversations((current) =>
                    current ? current.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item)) : current,
                );
            } catch (error) {
                log.warn('A conversation could not be marked read.', { error });
            }
        },
        [setUnreadCount],
    );

    const loadConversation = useCallback(
        async (conversationId: number) => {
            const detail = await getConversation(conversationId);
            setOpen({ conversationId, user: detail.conversation.otherUser });
            setMessages(detail.messages);
            setConversations((current) => (current ? withConversation(current, detail.conversation) : current));
            if (detail.conversation.unreadCount > 0) await readOpen(conversationId);
        },
        [readOpen],
    );

    const loadList = useCallback(async () => {
        const list = await listConversations();
        setConversations([...list.items].sort(byLatest));
        setUnreadCount(list.unreadCount);
    }, [setUnreadCount]);

    useEffect(() => {
        const start = async () => {
            try {
                await loadList();
                if (withUserId === null) return;
                const partner = await getChatPartner(withUserId);
                if (partner.conversationId !== null) await loadConversation(partner.conversationId);
                else {
                    setOpen({ conversationId: null, user: partner.otherUser });
                    setMessages([]);
                }
            } catch (error) {
                failed(error);
                setConversations((current) => current ?? []);
            }
        };
        void start();
    }, [withUserId, loadList, loadConversation, failed]);

    useEffect(
        () =>
            listen({
                onMessage: (event: SentMessage) => {
                    const shown = openRef.current;
                    const mine = shown !== null && shown.user.id === event.conversation.otherUser.id;
                    const incoming = mine && !event.message.isMine ? { ...event.conversation, unreadCount: 0 } : event.conversation;
                    setConversations((current) => (current ? withConversation(current, incoming) : current));
                    if (!mine) return;
                    setOpen({ conversationId: event.conversation.id, user: event.conversation.otherUser });
                    setMessages((current) =>
                        current.some((message) => message.id === event.message.id) ? current : [...current, event.message],
                    );
                    if (!event.message.isMine) void readOpen(event.conversation.id);
                },
                onReconnect: () => {
                    void loadList().catch(failed);
                    const shown = openRef.current;
                    if (shown?.conversationId) void loadConversation(shown.conversationId).catch(failed);
                },
            }),
        [listen, loadList, loadConversation, readOpen, failed],
    );

    useEffect(() => {
        bottom.current?.scrollIntoView({ block: 'end' });
    }, [messages]);

    const openConversation = (conversation: Conversation) => {
        setDraft('');
        setDraftError(null);
        void loadConversation(conversation.id).catch(failed);
    };

    const close = () => {
        setOpen(null);
        setMessages([]);
        setDraft('');
        setDraftError(null);
    };

    const send = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!open || sending) return;
        const text = draft.trim();
        if (text.length === 0) {
            setDraftError(t('Type a message.'));
            return;
        }
        if (text.length > CHAT_LIMITS.MESSAGE_MAX) {
            setDraftError(t('Use up to 1,000 characters.'));
            return;
        }
        setSending(true);
        try {
            const sent = await sendMessage(open.user.id, text);
            setDraft('');
            setDraftError(null);
            setOpen({ conversationId: sent.conversation.id, user: sent.conversation.otherUser });
            setMessages((current) =>
                current.some((message) => message.id === sent.message.id) ? current : [...current, sent.message],
            );
            setConversations((current) => withConversation(current ?? [], sent.conversation));
        } catch (error) {
            if (error instanceof ApiError && error.code === ApiError.NETWORK_ERROR) {
                showError(t('Could not reach the server. Please check your connection and try again.'));
            } else if (error instanceof ApiError) {
                setDraftError(error.fieldError('text') ?? t(error.message));
            } else {
                showError(t('This could not be done. Please try again.'));
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="page">
            <div className={cn('card ms-wrap', open && 'is-open')}>
                <div className="ms-list" role="list">
                    {conversations?.map((conversation) => (
                        <button
                            key={conversation.id}
                            type="button"
                            role="listitem"
                            className={cn(
                                'ms-item',
                                open?.conversationId === conversation.id && 'is-on',
                                conversation.unreadCount > 0 && 'is-unread',
                            )}
                            onClick={() => openConversation(conversation)}
                        >
                            <UserAvatar
                                userId={conversation.otherUser.id}
                                initials={initialsOf(conversation.otherUser.name)}
                                photoVersion={conversation.otherUser.photoVersion}
                                className="ms-av"
                            />
                            <span className="ms-li">
                                <span className="ms-top">
                                    <b>{conversation.otherUser.name}</b>
                                    <small>{messageStamp(conversation.lastMessage.sentAt)}</small>
                                </span>
                                <span className="ms-row">
                                    <span className="ms-last">{conversation.lastMessage.preview}</span>
                                    {conversation.unreadCount > 0 && (
                                        <span
                                            className="dd-cnt ms-cnt"
                                            aria-label={t('{n} unread', { n: conversation.unreadCount })}
                                        >
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </span>
                            </span>
                        </button>
                    ))}
                    {conversations?.length === 0 && <p className="ms-empty">{t('No conversations yet.')}</p>}
                </div>
                <div className="ms-conv">
                    {open ? (
                        <>
                            <div className="ms-head">
                                <button type="button" className="btn btn-text ms-back" onClick={close}>
                                    {t('Back')}
                                </button>
                                <UserAvatar
                                    userId={open.user.id}
                                    initials={initialsOf(open.user.name)}
                                    photoVersion={open.user.photoVersion}
                                    className="ms-av"
                                />
                                <Link className="up-link" href={userProfilePath(open.user.id)}>
                                    <b>{open.user.name}</b>
                                </Link>
                            </div>
                            <div className="ms-msgs">
                                {messages.map((message) => (
                                    <div key={message.id} className={cn('ms-msg', message.isMine && 'is-me')}>
                                        <p>{message.text}</p>
                                        <small>{messageStamp(message.sentAt)}</small>
                                    </div>
                                ))}
                                <div ref={bottom}></div>
                            </div>
                            <form className="ms-form" noValidate onSubmit={(event) => void send(event)}>
                                <div className={draftError ? 'field is-invalid' : 'field'}>
                                    <textarea
                                        id="ms-text"
                                        className="textarea"
                                        rows={2}
                                        placeholder={t('Type a Message')}
                                        aria-label={t('Type a Message')}
                                        value={draft}
                                        aria-invalid={draftError ? true : undefined}
                                        onChange={(event) => {
                                            setDraft(event.target.value);
                                            setDraftError(null);
                                        }}
                                    />
                                    {draftError && (
                                        <span className="error" role="alert">
                                            {draftError}
                                        </span>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {t('Send')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <p className="ms-none">{t('Select a conversation')}</p>
                    )}
                </div>
            </div>
            <SiteToast toast={toast} onClose={hide} />
        </div>
    );
}
