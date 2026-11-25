# Chat

**What it is.** Direct, private text messages between two website users (`chat_conversation`, `chat_message`), delivered live. The API module `apps/api/src/modules/chat/`, mounted at `/api/chat`. The process is in [WITW-Profiles-Wishlist-Chat-Workflow](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md) §4 and §5.

**Who uses it.** **Signed-in website users who are not partners**: Message on a User Profile, the **Messages** page (U5), Messages with its unread count in the account menu. A partner (Active or Inactive partner row) gets 403 `CHAT_PARTNER` ("Partners don't use Messages.") on every route, the stream included; its old conversations are kept. A guest gets 401.

**Workflows:** [WITW Profiles, Wishlist and Chat](../../workflows/WITW-Profiles-Wishlist-Chat-Workflow.md).

## Conversations and messages

- **One conversation per pair of users**: `first_user_id` is the lower user id, `second_user_id` the higher, and the pair is unique. It is created by the **first message** (sending to someone opens the pair's conversation or makes it).
- Messages are text only: trimmed, 1 to 1,000 characters ("Type a message." / "Use up to 1,000 characters."). `chat_message.user_id` is the sender.
- **Nothing is edited or deleted**: there are no such routes.
- **Read:** `read_at` is set on the other user's messages when the reader opens the conversation (`POST …/read`). The **unread count** is the number of unread messages sent to the user: per conversation and in total.
- **Who can receive:** an active user who is not a partner. To oneself: 422 `CHAT_SELF`; to a partner: 403 `CHAT_RECIPIENT_PARTNER`; to a deactivated account: 409 `CHAT_RECIPIENT_DEACTIVATED` ("This account is deactivated. Your message can't be sent."); unknown: 404 `CHAT_RECIPIENT_NOT_FOUND`. A deactivated account's conversations stay in the list (`otherUser.isActive` false, `canReceive` false).
- The list is **latest message first**; each shows the other user (name, `photoVersion`), the last message's **first 50 characters then "…"** (`preview`), its time, whether it was mine, and the conversation's unread count.

## Notification

Each message sends the recipient an in-app notification on the website (`client_app` 2): kind **1601 `CHAT_MESSAGE_RECEIVED`**, "{{actor}} sent you a message." (the sender), entity = the conversation (`AuditEntity.CHAT_CONVERSATION` 20, its id), title = the sender's name. It is in the notification module's All and Unread lists (no tab of its own) and opens Messages. Opening the conversation does not mark the notification read; opening the notification does.

## Live delivery (server-sent events)

- `GET /api/chat/stream` keeps a `text/event-stream` response open (the `openEventStream` helper in `core/http`). The browser opens it with `new EventSource(`${apiUrl}/api/chat/stream?app=web`, { withCredentials: true })`: `EventSource` sends no headers, so the client app comes from the `app` query value (allowed on GET) and the session from the website's access cookie, the same cookie every other call sends cross-origin (CORS allows the website's origin with credentials).
- Events (each `data` is JSON):
  - `chat-unread` `{ unreadCount }`: right after connecting, after a new message to the user, and after the user marks a conversation read (in another tab).
  - `chat-message` `{ conversation, message }`: a new message in one of the user's conversations, sent to the open streams of **both** users (the sender's other tabs too), each from that user's point of view (`isMine`, `unreadCount`).
- A comment line `: heartbeat` every 25 seconds keeps proxies from closing the connection; `retry: 5000` asks the browser to reconnect after 5 seconds. Closed streams are dropped from the hub; on shutdown the API ends every open stream.
- **In memory, per process**: the chat service hands a new message to the open streams of its two users (`ChatStreams`). The API runs as one process (pm2 fork mode in every environment); more than one process would need a shared channel.
- **After a reconnect** the page reloads the conversation list and the open conversation, so nothing sent while it was disconnected is lost. The stream checks the session only when it opens: when the access token has expired, the reconnect gets 401 and `EventSource` stops; the page then refreshes the session (`POST /api/auth/refresh`) and opens a new stream.

## Routes

| Route | Access |
|---|---|
| `GET /api/chat/conversations` → `{ items: [{ id, otherUser: { id, name, photoVersion, isActive, canReceive }, lastMessage: { preview, sentAt, isMine }, unreadCount }], unreadCount }` | signed-in (not a partner) |
| `GET /api/chat/conversations/:id` → `{ conversation, messages: [{ id, conversationId, senderUserId, text, sentAt, readAt, isMine }] }` (oldest first; not a participant: 404 `CHAT_CONVERSATION_NOT_FOUND`) | signed-in (a participant) |
| `POST /api/chat/conversations/:id/read` → `{ unreadCount }` (the new total) | signed-in (a participant) |
| `GET /api/chat/users/:id` → `{ otherUser, conversationId \| null }`: opening Messages with a user from their profile | signed-in (not a partner) |
| `POST /api/chat/messages` `{ recipientUserId, text }` → 201 `{ conversation, message }` "Your message is sent." | signed-in (not a partner) |
| `GET /api/chat/unread-count` → `{ unreadCount }` | signed-in (not a partner) |
| `GET /api/chat/stream?app=web` → the event stream | signed-in (not a partner) |

## Audit

Module 16: 1601 message sent (entity 21 `CHAT_MESSAGE`; the conversation, the recipient, the length, whether the conversation was created) · 1603 conversation read (entity 20 `CHAT_CONVERSATION`, the number of messages marked; only when there were some) · 1605 `ct_` test data removed; each failure is the next number (a refused send, such as to a deactivated account, is recorded as 1602).

## Where it lives

`apps/api/src/modules/chat/` (`services/chat.service.ts`, `services/chat-streams.ts`, SQL `sql/chat.sql.ts`); the stream helper `apps/api/src/core/http/event-stream.ts`; tables in [2026-11-24-profiles-wishlist-chat.sql](../../../../apps/api/src/database/migrations/2026-11-24-profiles-wishlist-chat.sql).
