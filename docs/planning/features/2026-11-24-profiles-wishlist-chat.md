# Profiles, Wishlist and Direct Chat

| Field | Value |
|---|---|
| Status | ready for staging (2026-11-25) |
| Started | 2026-11-24 |
| Shipped | |
| Apps | api / web / partner (one link) |
| Test cases | TC-WL-01..11, TC-PROF-01..18, TC-CHAT-01..14, TC-PTNR-01..05 |
| How it works | [workflows/WITW-Profiles-Wishlist-Chat-Workflow.md](../../how-it-works/workflows/WITW-Profiles-Wishlist-Chat-Workflow.md) (the process); to write: `modules/wishlist/`, `modules/profile/`, `modules/chat/`; to update: `modules/users/`, `modules/notification/`, `modules/partner/`, `modules/shared-safari/`, `modules/package/`, `platform/frontend-apps.md` (website frame) |

Status moves `proposed` → `in-progress` → `shipped` (see [TEMPLATE](../TEMPLATE.md)).

This file replaces the plan of 2026-11-23 (`2026-11-23-profiles-wishlist-chat.md`, deleted on 2026-11-24 at the user's request; it is in git history at b963f8e).

## 1. Requirement (as given)

> "First Check and Read this and then Update and sync my Prototype-sync and create a planning file for me and delete previous planning file and don't change anything else" (2026-11-24, with the workflow, the prototype and PROTOTYPE-SYNC attached)

The feature is defined by two sources, read together on 2026-11-24:

| Source | Version |
|---|---|
| Workflow | [WITW-Profiles-Wishlist-Chat-Workflow.md](../../how-it-works/workflows/WITW-Profiles-Wishlist-Chat-Workflow.md), as changed on 2026-11-24 (uncommitted): "in sync with the requirements" (`WITW-Profiles-Wishlist-Chat-Requirements.docx`) and the user's answers of 2026-11-20 and 2026-11-24; §1–§8, nine open questions in §9 |
| Prototype | **1bdd8df** (canvas version 33: boards **U1 Wishlist, U2 Partner Profile, U3 User Profile, U4 Edit Profile, U5 Messages**, each desktop and mobile, and changes to existing boards). Pin **79b0567** since 2026-11-24 (on top of 5d1b27e: design system matched to U1–U5, FileUpload, partner menu): canvas version 38 with the partner changes of 2026-11-24 ([PROTOTYPE-SYNC §2.1](../../PROTOTYPE-SYNC.md#21-checkout-changes-not-ready), rows marked v38). Not declared ready (PROTOTYPE-SYNC D2) |
| Schema | none yet: `2026-11-24-profiles-wishlist-chat.sql`, written in this feature (§2.3) |

In short: signed-in users save packages and shared safaris to a **Wishlist**; every active partner gets a public **Partner Profile**, and every user a public **User Profile** they edit themselves; signed-in users (not partners) send each other private text messages (**Direct Chat**), with an in-app notification per message. The Partner portal's Business Profile links to the public page. On the website a partner gets its own account menu and sees shared safaris view only.

## 2. Plan

### 2.1 Before any code (gates)

1. ~~**Prototype committed, pushed and pinned (PROTOTYPE-SYNC D2).**~~ Done 2026-11-24: canvas version 38 committed as 79b0567 on top of 5d1b27e, pushed, pinned.
2. ~~**Boards ready.**~~ Done 2026-11-24: declared ready by the user at 79b0567. Was: The user declares U1–U5 and the PROTOTYPE-SYNC §2.1 changes ready; their Ready cells get the commit and date.
3. ~~**Questions settled** (§2.8):~~ Done 2026-11-24 (§4): Q1 and Q3 by the user, the rest by Claude on the user's instruction ("further answer use your best decision"). Was: workflow #1–#4, #8, #9 and plan Q1 (live delivery), Q2 (addresses) before the API is written; the texts (workflow #5, #6) before the screens; PROTOTYPE-SYNC D3 (file upload box) before any file field is touched.
4. ~~**Migration written and applied.**~~ Done 2026-11-24 (local database only, §5). Was: `2026-11-24-profiles-wishlist-chat.sql` (§2.3) written; applied to the local database by the user (or by the agent after the user approves), then checked.

### 2.2 API modules

| Module | Owns (writes) | Mount | Audit module |
|---|---|---|---|
| `wishlist` (new) | `wishlist_item` | `/api/wishlist` | 14 (actions 1401…) |
| `profile` (new) | `user_profile` (date of birth, gender, bio, about, social links, photo, cover) | `/api/profile` | 15 (actions 1501…) |
| `chat` (new) | `chat_conversation`, `chat_message` | `/api/chat` | 16 (actions 1601…) |
| `users` | the name, changed from Edit Profile, through `usersService` (the `user` table stays owned by `users`) | existing | 1 |
| `notification` | sends the new kind **CHAT_MESSAGE_RECEIVED** (1601) to the website | existing | 6 |
| `partner` | read only: "is this an active partner", its logo, business name, about, active parks (U2) | existing | 10 |
| `package` | read only: "is this package shown on the website", its live version's price per person (the come-back rule, §1.2) | existing | 12 |
| `shared-safari` | read only: a safari's status and start (what can be saved), organised and joined safaris shown on the website (U3). The partner rules (no organise, no join) are already enforced (Phase 8 of Safari Packages); re-checked here (TC-PTNR-03, -04) | existing | 8 |

- **Dependencies, all through `createXModule(deps)`:** `wishlist` gets `packageService`, `sharedSafariService`, `partnerService` (partners have no wishlist) and `auditService`; `profile` gets `usersService`, `partnerService`, `sharedSafariService`, `fileStorage` and `auditService`; `chat` gets `usersService` (active, not a partner), `partnerService`, `notificationService` and `auditService`.
- **Code lists** (`as const`, in each module's `types/`): `WishlistItemType` (1 package, 2 shared safari); `Gender` (1 Male, 2 Female, 3 Other).
- **Reads with business meaning** go through the owning service: "can this user see this package / safari" stays in `package` / `shared-safari`.
- **Audit:** wishlist item added / removed; profile general information saved, photo saved / removed, cover saved / removed; message sent (conversation created with the first one). Each with its failure code.
- **Access:** profile pages are `publicAccess` for the header only (a guest gets no Profile / Shared Safaris content, workflow §3); wishlist and chat routes are `.signedIn` and refuse a partner in the service. Every new `publicAccess` route is listed here before it is added.
- **New `publicAccess` routes** (listed 2026-11-24 before they were added; all read-only `GET`):
  - `/api/profile/users/:id` (U3 header; through the `viewer` guard, which is public: a signed-in viewer also gets the Profile tab, a guest gets the header only);
  - `/api/profile/users/:id/photo` and `/api/profile/users/:id/cover-photo` (the pictures, for avatars and U3; an inactive or unknown user has none);
  - `/api/profile/partners/:id`, `/api/profile/partners/:id/packages`, `/api/profile/partners/:id/parks` (U2: an active partner's header, shown packages and active parks, 12 at a time).
  - The existing `POST /api/auth/sign-up` stays `publicAccess` and now also takes the date of birth and gender (Q3).

### 2.3 Schema (proposed, to confirm with the user)

`2026-11-24-profiles-wishlist-chat.sql`:

- `wishlist_item`: `id`, `user_id`, `item_type` (TINYINT, `WishlistItemType`), `package_id` / `shared_safari_id` (one set), `saved_price_per_person` (the package's price when saved, for the come-back rule, workflow #2), `is_hidden` (dropped out while the package is not shown), `status`, `created_at` (the "saved" time: newest first), audit columns. Unique per user and item; indexes on `user_id`, `package_id`, `shared_safari_id`.
- `user_profile`: `user_id` (one row per user), `date_of_birth` (DATE, NULL for existing users), `gender` (TINYINT NULL), `bio` and `about` (TEXT: no length limit, workflow §3.1), `facebook_url`, `x_url`, `instagram_url`, `youtube_url` (VARCHAR(1000) NULL), `photo`, `cover_photo` (stored file keys, NULL = placeholder), audit columns.
- `chat_conversation`: `id`, `user_id_low`, `user_id_high` (unique pair: one conversation per two users), `last_message_at`, audit columns. (Two pointers at `user` cannot both be `user_id`; the names are a proposal, to confirm with the user against convention 3.)
- `chat_message`: `id`, `chat_conversation_id`, `sender_user_id`, `message_text` (VARCHAR(1000), workflow #7), `read_at` (NULL = unread), `created_at`. No edit, no delete (workflow §5).

### 2.4 Screens (website, from U1–U5)

| Board | Route (Q2: by id) | What it does |
|---|---|---|
| U1 Wishlist | `/wishlist` | Tabs Packages (default) / Shared Safaris; P1 package card with the heart, W1 safari card; newest saved first; 6 at a time, Load More; "No Packages available" / "No Shared Safaris available". Guest → Login; partner → no page |
| U2 Partner Profile | `/partners/[id]` | Header (logo or WITW default logo, business name, About, tiles Packages / Parks opening their tab); tabs Packages (shown packages, cards with the heart) / Parks (active parks, P5 card); 12 at a time, Load More; "No packages available" / "No parks available"; inactive or unknown → home page. No phone or email |
| U3 User Profile | `/users/[id]` | Cover, picture, name; Edit Profile (own) / Message (someone else's, not for a partner viewer); tabs Profile (Bio, About, Social links, "–" when empty) / Shared Safaris (organised and joined, active on the website now); guest: header only and "Please sign in to view the full profile." with Sign in (`/login?next=…`); inactive, unknown, or a partner's account → home page (a partner opens U2) |
| U4 Edit Profile | `/my-profile` | Tabs General Information / Profile Photo / Cover Photo, each saved on its own. Field rules from workflow §3.1. Board texts: "Enter your name.", "Use up to 100 characters.", "Enter your date of birth.", "The date of birth can't be in the future.", "You must be 18 or older.", "Select your gender.", "Choose a JPG, JPEG or PNG file.", "Choose a file up to 250 KB." / "…500 KB."; helpers "A few short things about you", "Everything about you, in detail", "JPG, JPEG or PNG, up to 250 KB" / "…500 KB"; toasts "Your profile is saved.", "Your profile photo is saved.", "Your cover photo is saved."; Remove photo / Remove cover photo (placeholder image after). An existing user without date of birth or gender is not asked for them. A partner can open it too (the board's My Profile for a partner) |
| U5 Messages | `/messages` | Left: conversations, latest first (picture, name, first 50 characters + "…", date and time, unread count), "No conversations yet."; right: the open conversation (name links to the profile, bubbles with time, Type a Message, Send) or "Select a conversation"; Back on phone. Opening marks read. Board errors: "Type a message.", "Use up to 1,000 characters.", "This account is deactivated. Your message can't be sent." Message on U3 opens U5 with that user (the conversation is created by the first message). Partner → home page |

### 2.5 Changed screens (PROTOTYPE-SYNC §2.1)

- **Website frame, user menu:** My Profile · My Shared Safaris · My Quote Requests · Wishlist · Messages (with unread count) · Change Password · Log Out.
- **Website frame, partner menu** (workflow §C, user 2026-11-24): My Profile · My Packages · Change Password · Partner portal · Log Out; no My Shared Safaris (ours shows it today), My Quote Requests, Wishlist or Messages. Targets of My Profile and My Packages: workflow #8 (the v38 board: U4 Edit Profile and Partner portal › Packages).
- **Partner on shared safaris** (workflow §C, user 2026-11-24): view only, no Organize a Shared Safari, no Join Safari. Ours already hides both (W1, W3, W9 rows, Safari Packages Phase 8); re-checked against v38: card buttons View Safari, Leave Safari and Seat Full stay. Commenting: workflow #9.
- **Bell and Notifications:** "{name} sent you a message." items (tag Messages), opening `/messages`; profile photo replaces initials in every avatar.
- **Names link to profiles:** host on safari cards (W1, W2, P6, U1, U3), W3 "Organized by", comment and reply writers, Interested list (W4); a partner's name opens U2.
- **Hearts:** P1 and P6 package cards, U1 / U2 cards, P2 (beside the price), W3 (Active or Seat full and not started, or already saved). Not for a partner; a guest goes to Login and comes back (`/login?next=…`), then taps again (workflow §A).
- **P2:** new line "Operated by {business name}" linking to U2.
- **PP9 (partner app):** View public page button (to the website's U2).
- **Web-Sign-Up** (Q3, user 2026-11-24): Sign Up also asks **date of birth** and **gender**, required, with the U4 rules and texts ("Enter your date of birth.", "The date of birth can't be in the future.", "You must be 18 or older.", "Select your gender."); saved into `user_profile` with the new account. Login is unchanged. Become a Partner (P4) is unchanged. A difference from the Web-Sign-Up board (unchanged there): recorded in PROTOTYPE-SYNC when built.
- **P3:** Travellers centred, card shadow (style only).
- **File upload box (D3):** not adopted (§4, 2026-11-24): every file field keeps the 2026-11-16 pattern (button, file name, Remove), and U4's Profile Photo and Cover Photo use the same pattern. A difference from the boards, recorded in PROTOTYPE-SYNC when built.

### 2.6 Live messages

The workflow asks for new messages to arrive without refreshing (*user, 2026-11-20*). The repo has no live channel today (no WebSocket or server-sent events). **Decided 2026-11-24 (§4): live, by server-sent events.** The API gets `GET /api/chat/stream` (`.signedIn`, a partner refused), kept open per signed-in tab, and a new response helper in `core/http` for the event stream (nothing outside `core/` writes to `res`). The API runs as one process (pm2 fork mode, every environment), so the chat service hands a new message to the open streams of its two users in memory; no new infrastructure. The browser opens the stream with `EventSource` through `services/chat.service.ts`; on reconnect it reloads the conversation list and the open conversation, so nothing sent while disconnected is lost. Events: a new message (U5 list and open conversation), the unread count (account menu). Options considered (Q1): polling the open conversation and the unread count every few seconds (no new infrastructure); server-sent events from the API (one new response helper in `core/http`, connections kept open per signed-in tab); or WebSocket (new infrastructure adapter, more moving parts).

### 2.7 Docs

- Write `docs/how-it-works/modules/wishlist/`, `profile/`, `chat/`; update `users`, `notification`, `partner`, `shared-safari`, `package` module docs and the website frame doc.
- The workflow `.md` is the user's: the §9 answers go there by the user (or by the agent when asked). It is not in the docx generator's list, so it has no `.docx`.
- PROTOTYPE-SYNC: U1–U5 rows and the §2.1 changes move into the board rows as each screen is built.

### 2.8 Open questions

**All answered on 2026-11-24 (§4).** Workflow #1–#9 take the prototype's suggestion. Kept here as asked:

| # | Question | Prototype suggests |
|---|---|---|
| Workflow #1 | A saved shared safari that is no longer Active / Seat full, or has started: can the user remove it with the heart? | Yes: W3 shows the heart while the safari is saved, whatever its status |
| Workflow #2 | Package coming back to the wishlist: which change stops it, and which price? | Only the **price per person** of the live version (compared with the price when saved) |
| Workflow #3 | Deactivated account: which history is shown, and does the profile open? | The profile goes to the home page; conversations stay; sending shows "This account is deactivated. Your message can't be sent." |
| Workflow #4 | A user who becomes a partner: their wishlist and conversations? | Wishlist and Messages are hidden from a partner (menu, page, hearts); U3 of a partner's account goes to U2; My Profile stays |
| Workflow #5 | Error messages for Edit Profile and the chat | The board texts in §2.4 |
| Workflow #6 | Notification text for a new message | "{name} sent you a message." |
| Workflow #7 | Message maximum of 1,000 characters (not confirmed by the client) | 1,000, "Use up to 1,000 characters." |
| Workflow #8 | Partner menu: where do My Profile and My Packages open? | My Profile → U4 Edit Profile; My Packages → Partner portal › Packages (PP4) |
| Workflow #9 | Partner "view only": does it also stop commenting on safaris they hosted or joined before? | No: W3 keeps the comment box for a partner |

New, from reading the boards with the codebase:

| # | Question |
|---|---|
| Q1 | Live messages: polling, server-sent events or WebSocket (§2.6)? An architecture decision |
| Q2 | Addresses of the public profiles: by id, or a new slug for users and partners (the `partner` and `user` tables have none)? |
| Q3 | Date of birth and gender are required in Edit Profile, but Sign Up and Become a Partner (Web-Sign-Up, P4: unchanged) don't ask for them. Asked at Sign Up, or only when General Information is first saved (the board makes them required only for accounts created after this feature)? |
| Q4 | Social links: the board uses URL fields (`type="url"`), and the workflow says "no other check than the requirements give". Any text, or must it be a web address? |
| Q5 | The User Profile's Shared Safaris tab: the board shows every safari with no paging. Keep it so, or 12 with Load More as U2? |
| Q6 | Unread count: in the account menu (Messages) and per conversation on U5, as the board? |
| D3 | The shared file upload box vs. the 2026-11-16 logo field decision (PROTOTYPE-SYNC D3) |

## 3. Test cases

Written before coding; each run in the browser at 1366 and 390 px unless marked otherwise. Texts follow §2.4 until workflow #5 / #6 are answered.

| TC-ID | Title | Pre-condition | Steps | Expected Result | Priority | Checked in |
|---|---|---|---|---|---|---|
| TC-WL-01 | Add and remove a package | Signed-in user, a shown package | Tap ♥ on a P1 card, then again | "You added the Package to your wishlist!", heart filled; then "You removed the Package from your wishlist!", heart empty; U1 follows | H | browser |
| TC-WL-02 | Add a shared safari | Signed-in user, an Active safari not started | Tap ♥ on W3 | "You added the Shared Safari to your wishlist!"; it is in U1 › Shared Safaris | H | browser |
| TC-WL-03 | Guest heart | Guest | Tap ♥ on P2 | Login page; after login back on P2, item not added until ♥ is tapped again | H | browser |
| TC-WL-04 | Partner has no wishlist | Active partner signed in | Open P1, P2, W3, the account menu, `/wishlist` | No hearts, no Wishlist menu item; the page is refused | H | browser |
| TC-WL-05 | Wishlist page | User with 8 saved packages | Open U1 | Packages tab first, newest saved first, 6 shown, Load More shows the rest | H | browser |
| TC-WL-06 | Empty tabs | User with nothing saved | Open both tabs | "No Packages available" / "No Shared Safaris available" | M | browser |
| TC-WL-07 | Package drops out and comes back | Saved package | Make it inactive, check U1; make it active with the same price, check; change price, hide and show again, check | Gone; back; gone for good (price per person, workflow #2) | H | browser |
| TC-WL-08 | Saved safari changes status | Saved safari | Set it Inactive, then open U1 | Still listed | M | browser |
| TC-WL-09 | Host saves own safari | Host of an Active safari | Tap ♥ on W3 | Added | M | browser |
| TC-WL-10 | Wishlist API guards | – | Call the wishlist routes as guest, as partner, with another user's item | 401; refused; not found | H | API |
| TC-WL-11 | Deleted shared safari stays saved | User saved a safari; its host deletes it | Open U1 › Shared Safaris; call `GET /api/wishlist/shared-safaris`; tap the card | Still listed with View Safari (user, 2026-11-25); the card opens "This safari is not available." | M | browser |
| TC-PROF-01 | Partner Profile | Active partner with packages and parks | Open the business name on P2 ("Operated by …") | U2: logo, name, About, counts; Packages tab; tiles switch tabs; no phone or email | H | browser |
| TC-PROF-02 | Partner Profile lists | Partner with 14 shown packages | Open U2, Load More; Parks tab | 12 then 14; active parks only; empty texts when none | M | browser |
| TC-PROF-03 | Inactive partner | Inactive partner | Open U2's address | Home page | H | browser |
| TC-PROF-04 | View public page | Partner signed in to the portal | Business Profile › View public page | The website's U2 for that partner | M | browser |
| TC-PROF-05 | Names open profiles | Safari with comments, joined users and a partner host | Tap the host, a comment writer, an Interested name, the partner | U3 for users; U2 for the partner | H | browser |
| TC-PROF-06 | Guest view | Guest | Open a U3 | Header only; both tabs "Please sign in to view the full profile."; Sign in returns to the profile | H | browser |
| TC-PROF-07 | Other user's profile | Signed-in user | Open someone's U3 | Bio, About, links, Shared Safaris (active on the website); Message button; no email or mobile | H | browser |
| TC-PROF-08 | Own profile | Signed-in user | Open own U3 | Edit Profile button, no Message | M | browser |
| TC-PROF-09 | Inactive or unknown user | Deactivated user | Open their U3 | Home page | H | browser |
| TC-PROF-10 | Edit General Information | Signed-in user | Save with empty name, future date, age under 18, no gender; then valid values | Each board message under its field; then "Your profile is saved." and U3 shows the new values; the name changes everywhere | H | browser |
| TC-PROF-11 | Existing user without date of birth | User created before this feature | Change only the bio and Save | Saved; no date of birth / gender asked | M | browser |
| TC-PROF-12 | Profile photo | Signed-in user | Upload a GIF, a 300 KB JPG, a 200 KB PNG; Save; then Remove photo and Save | Two errors; then "Your profile photo is saved." and the picture replaces the initials everywhere; after remove the placeholder | H | browser |
| TC-PROF-13 | Cover photo | Signed-in user | Upload a 600 KB then a 400 KB JPG; Save; remove | Error; saved; placeholder | M | browser |
| TC-PROF-14 | Profile API checks | – | Send an over-long name, a future date, a 300 KB photo straight to the API | Refused with the same rules as the form | H | API |
| TC-PROF-15 | Sign Up asks date of birth and gender | Guest | Sign Up with each left empty, a future date, an age under 18, then valid values | "Enter your date of birth.", "The date of birth can't be in the future.", "You must be 18 or older.", "Select your gender."; then the account is created and U4 shows both | H | browser |
| TC-PROF-16 | Login and existing users not asked | Existing user without date of birth or gender | Log in; open U4 | No date of birth or gender asked at Login; U4 saves without forcing them | M | browser |
| TC-PROF-17 | ~~Social link must be a web address~~ Superseded 2026-11-25 by TC-PROF-18 (Q4 reverted) | Signed-in user | Save "facebook" as a link, then "https://facebook.com/x"; send the first straight to the API | Refused in the form and the API; then saved | M | browser |
| TC-PROF-18 | Social link: any text, link only for http(s) | Signed-in user | Save "facebook" as Facebook and "https://instagram.com/x" as Instagram (form and straight to the API); save 1,001 characters; open U3 | Both saved as typed; 1,001 refused with "Use up to 1,000 characters." in the form and the API; on U3 Facebook is plain text, Instagram a link opening a new tab | M | browser |
| TC-CHAT-01 | Start a conversation | Two signed-in users, no conversation | Message on U3, type, Send | Conversation created with the first message; it heads the list | H | browser |
| TC-CHAT-02 | One conversation per pair | Existing conversation | Message from the other user's profile | Opens the same conversation | H | browser |
| TC-CHAT-03 | Empty and long messages | Open conversation | Send blank; send 1,001 characters | "Type a message."; "Use up to 1,000 characters." | H | browser |
| TC-CHAT-04 | Live arrival | Two browsers, same conversation | B sends | A sees it without refreshing; unread count updates | H | browser |
| TC-CHAT-05 | Notification | B sends to A | A opens the bell and Notifications | "{B} sent you a message." (workflow #6), opens Messages | H | browser |
| TC-CHAT-06 | Mark read | A has unread messages | Open the conversation | Unread count clears in the list and the account menu | H | browser |
| TC-CHAT-07 | List preview | Last message over 50 characters | Open U5 | First 50 characters then "…", with date and time | M | browser |
| TC-CHAT-08 | Deactivated recipient | Recipient deactivated | Send | "This account is deactivated. Your message can't be sent."; old messages stay | H | browser |
| TC-CHAT-09 | Partner and guest | Partner; guest | Open `/messages`; open a U3 | Partner: no Messages menu, page refused, no Message button; guest: Login and back | H | browser |
| TC-CHAT-10 | No edit or delete | Conversation | Look for edit / delete; call the API | None on screen; no such route | M | browser |
| TC-CHAT-11 | Phone layout | 390 px | Open U5, a conversation, Back | List, then conversation full width, Back returns to the list | M | browser |
| TC-CHAT-12 | Chat API guards | – | Send as guest, to oneself, to a partner, read someone else's conversation | 401; refused; refused; not found | H | API |
| TC-CHAT-13 | Reconnect keeps messages | Two browsers, A on U5 | Cut A's connection (offline), B sends twice, restore | A shows both messages and the right unread count without refreshing | H | browser |
| TC-CHAT-14 | Live stream guards | – | Open `/api/chat/stream` as a guest and as a partner | 401; refused | H | API |
| TC-PTNR-01 | Partner account menu | Active partner signed in on the website | Open the account menu | Exactly My Profile, My Packages, Change Password, Partner portal, Log Out, in that order | H | browser |
| TC-PTNR-02 | Partner menu targets | Active partner | Tap My Profile, then My Packages | The pages decided in workflow #8 | H | browser |
| TC-PTNR-03 | No Organize for a partner | Active partner | Open W1, W9, P6 › Shared Safaris | No Organize a Shared Safari button anywhere | H | browser |
| TC-PTNR-04 | No Join for a partner | Active partner, a safari they don't host or belong to | Open the safari card and W3; call the join route | No Join Safari; the API refuses the join | H | browser |
| TC-PTNR-05 | User menu unchanged | Signed-in user (not a partner) | Open the account menu | My Profile, My Shared Safaris, My Quote Requests, Wishlist, Messages, Change Password, Log Out | M | browser |

## 4. Decisions

From the workflow (recorded there, repeated here so the plan stands alone):

- 2026-11-20: A guest who taps the heart logs in, comes back and taps again; nothing is added automatically.
- 2026-11-20: A host can add their own shared safari to the wishlist.
- 2026-11-20: Wishlist: Load More, 6 at a time.
- 2026-11-20: A package that is shown again with everything on its card the same comes back into the wishlist; if its price changed it does not (which price and which fields: workflow #2).
- 2026-11-20: User Profile › Shared Safaris shows only those active on the website now.
- 2026-11-20: Social links: no other check than the requirements give (Q4 for what that means for the field).
- 2026-11-20: Edit Profile: each tab saved on its own; photos can be removed (placeholder image then); existing users without date of birth or gender are not asked for now.
- 2026-11-20: The unread count is shown.
- 2026-11-20: New messages arrive live (how: Q1).
- 2026-11-20: Conversation list shows the first 50 characters of the last message, then "…", and its date and time.
- 2026-11-20: A deactivated account's conversations stay; sending to it shows that the account is deactivated.
- 2026-11-20: Message maximum 1,000 characters, left to Claude's judgement; not confirmed by the client (workflow #7).
- 2026-11-24: A partner sees shared safaris view only: can browse the list and open a safari, can't organise or join; the Organize a Shared Safari and Join Safari buttons are not shown to a partner.
- 2026-11-24: A partner's website account menu is My Profile · My Packages · Change Password · Partner portal · Log Out, with no Wishlist, Messages, My Shared Safaris or My Quote Requests (targets: workflow #8).
- 2026-11-24: The plan of 2026-11-23 is deleted and replaced by this file (user).
- 2026-11-24 (user): **Q1** New messages appear without a page reload (live). The mechanism, server-sent events (§2.6), chosen by Claude on the user's instruction.
- 2026-11-24 (user): **Q3** Sign Up asks date of birth and gender (required); Login does not. Existing users are still not asked (the 2026-11-20 decision stands).
- 2026-11-24 (user): "further answer use your best decision". Claude's decisions on that instruction, each open to change by the user:
  - **Q2** Profile addresses by id: `/users/[id]`, `/partners/[id]`. No slug column; nothing added to `user` or `partner`.
  - ~~**Q4** Social links must be a web address (`http://` or `https://`), checked in the form and the API alike; empty is allowed; up to 1,000 characters.~~ Superseded 2026-11-25 by the user: reverted to the workflow (R242), see below.
  - **Q5** User Profile › Shared Safaris: 12 at a time with Load More, as U2.
  - **Q6** Unread count as the board: on Messages in the account menu and per conversation on U5.
  - **D3** The shared file upload box is not adopted; the 2026-11-16 logo field pattern stays and is used for U4's photos. No file field in any app changes.
  - **Workflow #1** A saved shared safari can be removed with the heart whatever its status.
  - **Workflow #2** Only the live version's price per person decides the come-back: same as when saved, the package comes back; changed, it does not.
  - **Workflow #3** A deactivated account's profile goes to the home page; its conversations stay; sending shows "This account is deactivated. Your message can't be sent."
  - **Workflow #4** A user who becomes a partner: Wishlist and Messages are hidden (menu, pages, hearts); their rows are kept; their U3 opens U2; My Profile stays.
  - **Workflow #5** Error messages: the board texts in §2.4.
  - **Workflow #6** Notification: "{name} sent you a message."
  - **Workflow #7** Message maximum 1,000 characters, "Use up to 1,000 characters."
  - **Workflow #8** Partner menu: My Profile → U4 Edit Profile; My Packages → Partner portal › Packages (PP4). **To confirm** (user, 2026-11-25); built so and checked by TC-PTNR-02.
  - **Workflow #9** A partner can still comment on shared safaris (W3 keeps the comment box).
- 2026-11-24 (user): U1–U5 and every PROTOTYPE-SYNC §2.1 change declared ready at 79b0567.
- 2026-11-24 (Claude, Phase 1 API; open to change by the user). Points the plan left open, settled while building:
  - **chat_conversation's two user pointers** are `first_user_id` (the lower user id) and `second_user_id` (the higher): convention 3 can't give two columns the name `user_id`, so each keeps the `user_id` ending with a word for its place in the pair, like the audit columns' exception; the order makes the unique pair key work (one conversation per two users). `chat_message` has a single pointer at `user`, so it is plain `user_id` (the sender), not the proposed `sender_user_id`.
  - **wishlist_item** gets `saved_at` (the last save, for "newest saved first"; saving again after a remove reuses the row, so `created_at` can't be that time) and a status code 2 "dropped for good" next to -1 "removed by the user"; two unique keys (user + package, user + shared safari) instead of one.
  - **user_profile.bio / about are MEDIUMTEXT**, not TEXT: TEXT holds only 64 KB, less than one request can carry, so "no length limit" would end in a database error.
  - **Gender and the date-of-birth rules live in `core/validation/person.ts`** (shared by Sign Up in auth and Edit Profile in profile, AGENTS "core/ when shared"), not in the profile module's `types/`.
  - **Sign Up and the profile module:** auth is built before profile (profile needs partner, partner needs auth), so the profile writer is connected afterwards (`auth.connectSignUpProfiles(profile.profileService)`), as `park.connectPriceSource` does; the user, the profile row and the session are one transaction.
  - **Edit Profile and existing users:** the date of birth and gender may stay empty only while none is stored; once stored they can't be cleared ("Enter your date of birth." / "Select your gender.").
  - ~~**Social link message:** "Enter a web address that starts with http:// or https://." (no board text exists); "Use up to 1,000 characters." over 1,000.~~ Superseded 2026-11-25 (Q4 reverted).
  - **The come-back rule** is checked whenever the wishlist is read (as the prototype's `wlSync`): a package not shown is marked hidden; shown again at the saved price it comes back, at another price it is dropped for good. A package hidden and shown again between two reads of the user's wishlist is not noticed.
  - ~~**Saved shared safaris** stay listed whatever their status, except a safari deleted by its host or by the Super Admin (a deleted row is not shown anywhere on the website). To confirm with the user.~~ Superseded 2026-11-25 (user), see below.
  - **The profile module also uses `packageService` and `parkService`** (U2's Packages and Parks tabs), besides the dependencies in §2.2.
  - **User Profile of a partner's account** answers `{ kind: 'partner', partnerId }` for an active partner (the website opens U2, workflow #4); an inactive partner's account is "not available" (home page).
  - **Chat notifications:** entity = the conversation (audit entity 20), title = the sender's name, no excerpt (the message is private); one per message, as the prototype. Opening the conversation does not mark them read.
  - **Live stream:** `EventSource` can't send headers, so the website opens `/api/chat/stream?app=web` with credentials; the client app comes from the `app` query value (already allowed for GET). The stream checks the session only when it opens; after the access token expires a reconnect gets 401 and the page must refresh the session and reopen.
  - **Avatars elsewhere** (safari cards, comments, Interested list, notifications) don't carry a photo version yet: the website can load `/api/profile/users/:id/photo` and fall back to initials on 404, or a later change adds `photoVersion` to those answers. Left for Phase 2 to decide.
  - 2026-11-25 (Phase 2; replaces the line above): **avatars carry `photoVersion`.** The API cards, host, faces, Interested list, comment writers and notifications (`actorId`, `actorPhotoVersion`) now answer the photo version (joined to `user_profile`), so the website shows the photo else the initials and never probes `/photo` for a 404; a partner keeps the logo. The D3 file field and the Q3 sign-up fields are built as decided.
- 2026-11-25 (user): **Temporary, to confirm (workflow R206): deleted shared safaris stay in the wishlist for now.** This is the user's temporary instruction, not a confirmed decision. The user is checking the Shared Safari workflow for what happens to a deleted safari's page. If they confirm deleted safaris should disappear: hide them when the wishlist is read (the wishlist rows are not deleted), record it in PROTOTYPE-SYNC as "differs from workflow R206, to confirm", and add it to the questions for the team.
- 2026-11-25 (user): **Account notifications on the Notifications page keep the board's avatar**: the signed-in user's own avatar, which is their profile photo when one is set, else their initials (asked because the user first wanted no own photo; the board shows it). No change.
- 2026-11-25 (user): **Q4 reverted to the workflow (R242, "no other check")**: social links take any text up to 1,000 characters (the column width), stored as typed (spaces at either end removed, as every text field); no web-address check in the form or the API. On the User Profile a link is a link only when it starts with `http://` or `https://`, otherwise plain text.
- 2026-11-25 (user): **Status "ready for staging", not "shipped"**: nothing is deployed yet. The commit is made locally and not pushed; the user names the branch to push to. `shipped` is set only after it is deployed.

## 5. Execution log

- 2026-11-24: Plan written. Read the workflow (2026-11-24 answers, §9 #8 and #9 new) and the prototype checkout: 5d1b27e (pushed, design system) plus uncommitted canvas version 38, every board diffed with the pin 1bdd8df: 44 board files changed (the partner account menu, Organize and Join hidden for a partner), recorded in PROTOTYPE-SYNC (header, D2, §2.1 rows marked v38, plan links moved here). The 2026-11-23 plan deleted. No code, no migration yet; waiting on the §2.1 gates.
- 2026-11-24: Canvas version 38 committed in the prototype repository as 79b0567, pushed, and the pin moved to it (user: "commit and push my all ground work"). Gate 1 done; PROTOTYPE-SYNC header, D1, D2 and §2.1 updated.
- 2026-11-24: Questions answered (gate 3): Q1, Q3 by the user, the rest by Claude on the user's instruction (§4); §2.4 routes, §2.5, §2.6 updated. Still waiting on gate 2 (boards declared ready) before code.
- 2026-11-24: Boards declared ready by the user at 79b0567 (gate 2); PROTOTYPE-SYNC Ready cells, D2 and §2.1 updated. Status in-progress.
- 2026-11-24: Phase 1 (database and API). Migration `2026-11-24-profiles-wishlist-chat.sql` written and applied to the **local** database only (`workshop_witw_db`), then checked by query: `wishlist_item` 13 columns, `user_profile` 16, `chat_conversation` 8, `chat_message` 9, with the unique keys and indexes of the file and no foreign keys; template 1601 present. `bio` / `about` changed to MEDIUMTEXT in the file and locally (§4). Modules `wishlist` (14), `profile` (15), `chat` (16) added and mounted; users (`rename`), partner (`activePartnerById`), park (`websiteCardsOf`), package (`shownCards`, `listShownOfPartner`, `pricePerPerson`), shared-safari (`sharedSafariService`), auth (Sign Up with date of birth and gender), notification (kind 1601), `core/http` `openEventStream`, `core/validation` person fields; `test-data/remove-ct` also removes wishlist items, profiles (with photo folders) and conversations. `npx tsc --noEmit` and `npm run lint` in apps/api pass; `route/list` shows every new route with its access. Docs: `modules/wishlist/`, `profile/`, `chat/` written; `auth`, `users`, `notification`, `partner`, `shared-safari`, `package`, `park`, the modules index and `platform/adding-a-module.md` updated. Website frame doc: Phase 2 (screens).
- 2026-11-24: API checks with curl on the running local API (accounts `ct_alpha`, `ct_beta`, `ct_gamma` made through Sign Up, `ct_partner` through Become a Partner and made active in the database as a fixture; package 72 hidden, re-shown and its price changed by +1 and back as a fixture, restored to website status 2 and ₹155,000). Every row removed afterwards with `test-data/remove-ct confirm` (2 notifications, 3 wishlist items, 1 conversation, 4 profiles, 1 partner, 4 accounts; photo folder gone); the database checked empty of `ct_` rows.
  - TC-PROF-14 PASS (API): `PUT /api/profile/me` with a 101-character name, a 2031 date of birth and "facebook" → 422 with "Use up to 100 characters.", "The date of birth can't be in the future.", "Enter a web address that starts with http:// or https://."; a 300 KB JPG → 422 "Choose a file up to 250 KB."; a GIF → 422 "Choose a JPG, JPEG or PNG file." (audited 1504); a 200 KB PNG saved; cover 600 KB refused, 400 KB saved; removing the photo → photo URL 404 and the file gone.
  - TC-PROF-15 API part PASS: Sign Up without date of birth / gender, with a future date, under 18, gender 9 → the four board messages under their fields; valid → 201 and `user_profile` holds the date and gender. Become a Partner unchanged (no profile row). Screens: Phase 2.
  - TC-PROF-16 API part PASS: sign-in unchanged; a partner with no date of birth saves General Information without one; clearing a stored date of birth → "Enter your date of birth.".
  - TC-PROF-17 API part PASS: "facebook" refused, `https://facebook.com/x` saved.
  - TC-WL-10 PASS (API): guest → 401; partner → 403 `WISHLIST_PARTNER` (add and ids); another user's item → 404 `WISHLIST_ITEM_NOT_FOUND`; also unknown package → 404, a started safari → 404 `WISHLIST_SAFARI_NOT_AVAILABLE`, removing twice → 404.
  - TC-WL-07 API part PASS: package 72 hidden → gone from `/ids` (`is_hidden` 1); shown at the same price → back; hidden, price changed, shown → gone for good (status 2); saving again → back.
  - TC-CHAT-12 PASS (API): send as guest → 401; to oneself → 422 `CHAT_SELF`; to a partner → 403 `CHAT_RECIPIENT_PARTNER`; a third user reading the conversation → 404 `CHAT_CONVERSATION_NOT_FOUND`; also blank → "Type a message.", 1,001 characters → "Use up to 1,000 characters.", partner sending → 403 `CHAT_PARTNER`.
  - TC-CHAT-14 PASS (API): `/api/chat/stream?app=web` as a guest → 401, as a partner → 403 `CHAT_PARTNER`.
  - SSE between two users PASS (API): both streams opened with the session cookie; on connect each got `chat-unread {0}`; A's first message created conversation 1 and reached both streams as `chat-message` (each from its own side) and B's `chat-unread {1}`; B's reply went to the same conversation (one per pair) and reached both; closing the streams logged an access line, no error.
  - TC-CHAT-08 API part PASS: recipient deactivated → 409 "This account is deactivated. Your message can't be sent."; the conversation stays in the list with `isActive` false. TC-CHAT-10 API part PASS: no edit or delete route (404 `ENDPOINT_NOT_FOUND`). TC-CHAT-05 API part PASS: one 1601 notification per message to the recipient, shown in the feed with the template "{{actor}} sent you a message.". TC-CHAT-06 API part PASS: marking read → `unreadCount` 0.
  - Profile pages (API): guest gets the header with `profile: null`; another user gets the profile and `canMessage` true; own `isOwn` true; a partner viewer `canMessage` false; the partner's account → `{ kind: 'partner', partnerId }`; unknown → 404; Shared Safaris as a guest → 401. Partner Profile of partner 31: 4 packages (12 a page, all its own), 3 active parks; unknown partner → 404.
  - Every other test case ran in the browser in Phase 2 (below).
- 2026-11-25: Phase 2 (screens), built in `apps/web` (U1 `/wishlist`, U2 `/partners/[id]`, U3 `/users/[id]`, U4 `/my-profile`, U5 `/messages`; the user and partner account menus with the Messages unread count; ♥ on P1, P6, P2, U1, U2 cards and W3; "Operated by" on P2; names linking to U3 / U2 on cards, W3, comments and the Interested list; the chat notification in the bell and Notifications; Sign Up with date of birth and gender; profile photos in every avatar) and `apps/partner` (PP9 View public page, to `NEXT_PUBLIC_WEBSITE_URL` + `/partners/<id>`). API additions: `photoVersion` on every shared-safari person (host, faces, Interested, comment and reply writers: joined to `user_profile` in the SQL, DTO, mapper) and `actorId` / `actorPhotoVersion` on notifications. The live stream is opened by `services/chat.service.ts` (`EventSource`); only `api-client` calls `fetch`. `eslint.config.mjs` of web: the new component folders get the same `no-img-element` exception as the other site components. `npx tsc --noEmit` passes in api, web, partner and manage; `npm run lint` passes in api (no warnings), web and partner (0 errors; the 3 / 4 `<img>` warnings are the existing ones); `npm run build` passes in web and partner.
- 2026-11-25: Browser runs (Playwright, Chrome, `http://localhost:3040`, 1366 and 390 px, console errors and failed calls collected, sideways scroll checked). Test data: `ct_alpha`, `ct_beta`, `ct_gamma`, `ct_delta`, `ct_epsilon`, `ct_partner` and two Sign Up accounts, a `ct_` shared safari, two `ct_` partners (made Active in the database as fixtures), conversations, wishlist items and pictures, all removed with `test-data/remove-ct confirm` (the accounts use `@ct-test.local`, because the command never selects `@example.test` accounts); package 72 was hidden, re-priced and restored (website status 2, ₹155,000); partner 38's parks were set removed and went with the partner. Two test-script mistakes found and fixed on the way (not product faults): a page-title text match counted as an Organize button (TC-PTNR-03), and the case-sensitive match on the upper-cased banner (TC-PROF-01). One product fix: the unread badge of the open conversation flashed until the "read" call returned (TC-CHAT-04); the list now clears it as the message arrives. TC-CHAT-13 cuts the stream by restarting the API with the page's reconnects blocked (Playwright's offline switch does not close an open event stream).
  - TC-WL-01 PASS (browser, 1366 + 390 px): heart false->true, toast add true, in U1 1, toast remove true, card gone true, "No Packages available" 1, heart after false; no console errors, no failed calls; overflow false (390 px: same result)
  - TC-WL-02 PASS (browser, 1366 + 390 px): toast true; card in U1 Shared Safaris 1; no console errors, no failed calls (390 px: same result)
  - TC-WL-03 PASS (browser, 1366 + 390 px): guest heart -> /login?next=%2Fpackages%2Fmangrove-majesty-bhitarkanika-national-park; after login back on /packages/mangrove-majesty-bhitarkanika-national-park, heart pressed false, saved ids [] (390 px: same result)
  - TC-WL-04 PASS (browser, 1366 + 390 px): hearts [["P1",0],["P2",0],["W3",0]]; menu ["My Profile","My Packages","Change Password","Partner portal","Log Out"]; /wishlist -> /; API ids 403 WISHLIST_PARTNER (390 px: same result)
  - TC-WL-05 PASS (browser, 1366 + 390 px), re-run 2026-11-25 with 14 saved ct packages (a ct partner's, made live through the portal and Super Admin API calls): 6 shown, Load More -> 12 (button still there), Load More -> 14, button gone; newest saved first (ct Pkg 14 ... ct Pkg 01); no console errors, no failed calls, no sideways scroll. Replaces the 7-package run above.
  - TC-WL-06 PASS (browser, 1366 + 390 px): empty texts: packages 1, shared safaris 1; no console errors (390 px: same result)
  - TC-WL-07 PASS (browser, 1366 + 390 px): saved package 72: listed; made inactive -> gone; shown again at the same price -> listed again; hidden, live price +1, shown -> gone for good (wishlist row status 2); package 72 restored to website status 2 and ₹155,000 afterwards (390 px: same result)
  - TC-WL-08 PASS (browser, 1366 + 390 px): status change 200; card listed 1; button "View Safari"; no console errors (390 px: same result)
  - TC-WL-09 PASS (browser, 1366 + 390 px): host gamma on own safari: toast true; ids {"packageIds":[],"sharedSafariIds":[225]}; no console errors (390 px: same result)
  - TC-PROF-01 PASS (browser, 1366 + 390 px): "Operated by Tiger Trail Tours" opens /partners/31; name "Tiger Trail Tours", tiles ["4 Packages","3 Parks"], 4 package cards, Parks tile -> Parks tab with 3 park cards, no phone or email in the page true; no console errors, no failed calls; overflow false (390 px: same result)
  - TC-PROF-02 PASS (browser, 1366 + 390 px), re-run 2026-11-25 with a ct partner with 14 shown packages: U2 shows 12, Load More -> 14, button gone, all the partner's own; empty texts ("No packages available", "No parks available") and the 4-package / 3-park partner as in the earlier run; no console errors, no failed calls, no sideways scroll. Replaces the earlier "14 not exercised" note.
  - TC-PROF-03 PASS (browser, 1366 + 390 px): inactive partner 34 -> /; unknown partner -> / (390 px: same result)
  - TC-PROF-04 PASS (browser, 1366 + 390 px): portal session as ct_partner: Business Profile > View public page -> http://localhost:3040/partners/38 showing "ct Partner Safaris"; also My Packages target on the portal: /packages "Packages"; no console errors, no failed calls (390 px: same result)
  - TC-PROF-05 PASS (browser, 1366 + 390 px): host, comment writer, Interested name and card host -> U3; partner (comment writer, Interested) -> U2: [["host","/users/183"],["comment writer","/users/181"],["partner comment writer","/partners/39"],["interested name","/users/181"],["interested partner","/partners/39"],["card host","/users/183"]]; no console errors, no failed calls (390 px: same result)
  - TC-PROF-06 PASS (browser, 1366 + 390 px): guest sees header "ct beta" only; Profile tab and Shared Safaris tab both show "Please sign in..." (1/1), bio hidden true; Sign in -> /login?next=%2Fusers%2F182, back on /users/182 after login; no console errors, no failed calls (390 px: same result)
  - TC-PROF-07 PASS (browser, 1366 + 390 px): bio, about, links ["Facebook","YouTube"], Message button 1, no Edit Profile, no email/mobile/date of birth/gender shown true; Shared Safaris tab opens (beta has none, ct host gamma's safari is on U3 of gamma); no console errors, no failed calls; overflow false (390 px: same result)
  - TC-PROF-08 PASS (browser, 1366 + 390 px): own U3: Edit Profile 1, Message 0; another host's U3 lists the active safari (1 card); no console errors, no failed calls (390 px: same result)
  - TC-PROF-09 PASS (browser, 1366 + 390 px): deactivated ct_epsilon -> /; unknown id -> / (390 px: same result)
  - TC-PROF-10 PASS (browser, 1366 + 390 px): empty/future/no gender -> ["Enter your name.","The date of birth can't be in the future.","Select your gender."]; under 18 -> ["You must be 18 or older."]; valid -> toast true; menu name "ct alpha two", U3 "ct alpha two" with bio and about; no console errors, no failed calls; overflow false (390 px: same result)
  - TC-PROF-11 PASS (browser, 1366 + 390 px): only the bio changed: toast true, no field errors [], DB {"date_of_birth":null,"gender":null,"bio":"ct only bio"} (390 px: same result)
  - TC-PROF-12 PASS (browser, 1366 + 390 px): GIF -> ["Choose a JPG, JPEG or PNG file."]; 300 KB JPG -> ["Choose a file up to 250 KB."]; 200 KB PNG ok, saved toast true; photo in header 1, in the W3 comment avatar 2, on U3 picture; Remove photo + Save toast true, header initials back true, DB photo null; no console errors, no failed calls (390 px: same result)
  - TC-PROF-13 PASS (browser, 1366 + 390 px): 600 KB -> ["Choose a file up to 500 KB."]; 400 KB saved toast true, cover on U3; removed + saved true, DB cover null; no console errors, no failed calls (390 px: same result)
  - TC-PROF-15 PASS (browser, 1366 + 390 px): empty -> ["Enter your date of birth.","Select your gender."]; future -> ["The date of birth can't be in the future.","Select your gender."]; under 18 -> ["You must be 18 or older.","Select your gender."]; valid -> account created and U4 shows 1992-04-05 / gender 3; no console errors, no failed calls (390 px: same result)
  - TC-PROF-16 PASS (browser, 1366 + 390 px): existing user with no profile row: logged in with identifier and password only; U4 opens with date of birth "" and gender "" empty; no console errors, no failed calls (390 px: same result)
  - TC-PROF-17 PASS (browser, 1366 + 390 px): "facebook" -> form ["Enter a web address that starts with http:// or https://."], API 422; "https://facebook.com/ctalpha" saved true; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-01 PASS (browser, 1366 + 390 px): Message on U3 -> /messages?with=190 with no conversation ("No conversations yet." 1); first message sent: bubble shown, conversation heads the list, DB conversations {"n":1}; no console errors, no failed calls; overflow false (390 px: same result)
  - TC-CHAT-02 PASS (browser, 1366 + 390 px): beta's Message on alpha's U3 opened the same conversation (selected row 1, alpha's message visible); reply sent; one conversation row {"n":1}; alpha reopening from U3 sees the reply; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-03 PASS (browser, 1366 + 390 px): blank -> ["Type a message."]; 1,001 characters -> ["Use up to 1,000 characters."]; exactly 1,000 sent; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-04 PASS (browser, 1366 + 390 px): A (alpha) on the open conversation saw "ct live one" without a reload (page marker kept same-page, no unread badge true); on /packages the account menu went from "Messages" to "Messages 1" live; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-05 PASS (browser, 1366 + 390 px): bell item "CB ct beta sent you a message. Just now"; Notifications page "ct beta sent you a message." tag Messages; click opens /messages; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-06 PASS (browser, 1366 + 390 px): list badge "2", menu "Messages 2"; after opening the conversation the badge is gone and the menu reads "Messages"; no console errors, no failed calls (390 px: same result)
  - TC-CHAT-07 PASS (browser, 1366 + 390 px): list preview "preview text that is long enough to be cut: abcdef…" (51 characters = 50 + …), date and time "25 Nov 2026 10:16" (390 px: same result)
  - TC-CHAT-08 PASS (browser, 1366 + 390 px): send -> ["This account is deactivated. Your message can't be sent."]; earlier messages still shown (1); console errors ["Failed to load resource: net::ERR_FAILED","Failed to load resource: net::ERR_FAILED","Failed to load resource: the server responded with a status of 409 (Conflict)"]; failed ["409 POST /chat/messages"] (390 px: same result)
  - TC-CHAT-09 PASS (browser, 1366 + 390 px): partner: /messages -> /, no Message button on a U3 (0), menu ["My Profile","My Packages","Change Password","Partner portal","Log Out"], API 403 CHAT_PARTNER; guest: /messages -> /login?next=%2Fmessages, back on /messages after login, no Message button on U3 (0) (390 px: same result)
  - TC-CHAT-10 PASS (browser, 1366 + 390 px): no edit or delete control on a bubble (0); PATCH and DELETE /api/chat/messages/44 -> 404 ENDPOINT_NOT_FOUND, 404 ENDPOINT_NOT_FOUND (390 px: same result)
  - TC-CHAT-11 PASS (browser, 1366 + 390 px): phone 390 px: phone: list first (true), no conversation yet (true); opening one hides the list (true), Back visible (true), conversation 356px wide; Back returns to the list (true); overflow false; desktop 1366 px: desktop: list and conversation side by side (list stays visible true); Back button hidden true
  - TC-CHAT-13 PASS (browser, 1366 + 390 px): alpha's stream cut (API restarted, alpha's reconnects blocked) while beta sent two messages: alpha saw 0; after the stream is allowed again both appear (2) without a reload (page marker kept); open conversation stays read (badges 0, menu "Messages"); console errors ["Failed to load resource: net::ERR_FAILED","Failed to load resource: net::ERR_FAILED"]; failed [] (390 px: same result)
  - TC-PTNR-01 PASS (browser, 1366 + 390 px): menu ["My Profile","My Packages","Change Password","Partner portal","Log Out"]; no console errors, no failed calls (390 px: same result)
  - TC-PTNR-02 PASS (browser, 1366 + 390 px): My Profile -> /my-profile (Edit Profile, name "ct partner"); My Packages href http://localhost:3042/packages -> lands on http://localhost:3042/login (the portal's own sign-in until the portal session exists; PP4 checked below with a portal session); no console errors, no failed calls (390 px: same result)
  - TC-PTNR-03 PASS (browser, 1366 + 390 px): Organize buttons: W1 0, W9 0, P6 (/parks/achanakmar-tiger-reserve?tab=safaris) 0; no console errors, no failed calls (390 px: same result)
  - TC-PTNR-04 PASS (browser, 1366 + 390 px): 9 cards on the list with 0 card buttons (partner hosts and joins none); W3 Join Safari 0; POST join as partner -> 403 SHARED_SAFARI_PARTNER; no console errors, no failed calls (390 px: same result)
  - TC-PTNR-05 PASS (browser, 1366 + 390 px): user menu ["My Profile","My Shared Safaris","My Quote Requests","Wishlist","Messages","Change Password","Log Out"]; no console errors, no failed calls (390 px: same result)
  - Not run as new browser cases (already PASS above, API only): TC-WL-10, TC-PROF-14, TC-CHAT-12, TC-CHAT-14. TC-PROF-02 and TC-WL-05 were re-run with 14 packages (lines above).
  - TC-WL-11 (added check, user decision 2026-11-25: deleted shared safaris stay in the wishlist) PASS (API + browser, 1366 + 390 px): ct_alpha saved a ct safari, its host deleted it (200); `GET /api/wishlist/shared-safaris` still lists it (status -1); U1's Shared Safaris tab shows its card with View Safari and no console errors or failed calls while listing; tapping it opens `/shared-safaris/ct-safari-del`, the "This safari is not available." page, whose own lookup is the expected 404 (the two 404s in the console come from that page).
  - Screenshots (1366 and 390 each), in `/tmp/claude-1000/-home-triline-Documents-Workshop-my-project/e620d586-929a-4859-98b9-2f3f1bf65f32/scratchpad/shots/`: `wl01-u1-*`, `wl02-u1-*`, `wl03-*`, `wl05-first-*`, `wl05-all-*`, `wl06-*`, `wl07-*`, `wl08-*`, `prof01-u2-*`, `prof01-parks-*`, `prof02-empty-*`, `prof04-pp9-*`, `prof04-u2-*`, `prof05-interested-*`, `prof06-*`, `prof07-profile-*`, `prof08-*`, `prof10-errors-*`, `prof10-u3-*`, `prof11-*`, `prof12-preview-*`, `prof12-u3-*`, `prof13-u3-*`, `prof15-errors-*`, `chat01-*`, `chat03-*`, `chat04-*`, `chat05-bell-*`, `chat05-list-*`, `chat06-before-*`, `chat06-after-*`, `chat07-*`, `chat08-*`, `chat11-conv-*`, `chat11-back-390`, `chat13-*`, `ptnr01-*`, `ptnr03-w1-*`, `ptnr03-p6-*`, `ptnr04-w3-*`.
- 2026-11-25: Review checks before commit (user's list). Test data: `ct_ua` (197), `ct_ub` (198), `ct_uc` (199), `ct_up` (200, partner 42 "ct Up Safaris"), `ct_admin` (201, CLI Super Admin, to approve the partner request).
  - Q4 reverted (§4): `PUT /api/profile/me` with Facebook "facebook" → 200, saved as typed.
  - TC-PROF-18 PASS (API + browser, 1366 + 390 px): 1,001 characters → API 422 "Use up to 1,000 characters." (facebookUrl) and the same text in the form; "facebook" and "https://instagram.com/ctua" saved with the toast "Your profile is saved."; on U3 (as ct_ub) Facebook is plain text ("Facebook: facebook", a span) and Instagram a link (`target=_blank`); no sideways scroll; only failed calls the signed-out `401 /auth/refresh` on the sign-in page (known, earlier plans).
  - Public profile responses (API, guest and ct_ub): `GET /api/profile/users/197`, `/users/200` (partner account → `{kind:'partner',partnerId:42}`), `/partners/42`, `/partners/42/packages`, `/partners/42/parks`, `/partners/30/packages` (3 live packages), `/users/197/safaris` (guest 401): no key named email, mobile, phone, dateOfBirth or gender at any depth; a guest gets `profile: null`.
  - Conversation privacy PASS (API): ct_uc on ct_ua ↔ ct_ub's conversation 54: `GET` and `POST …/read` → 404 CHAT_CONVERSATION_NOT_FOUND; ct_uc's list has 0 conversations; ct_ub (control) 200.
  - Partner and guest refused PASS (API): as ct_up every wishlist route (ids, packages, shared-safaris, PUT / DELETE) → 403 WISHLIST_PARTNER, every chat route (conversations, a conversation, unread-count, users/:id, POST messages) → 403 CHAT_PARTNER, `/chat/stream` → 403; as a guest all of them → 401 UNAUTHENTICATED.
  - Stream delivery PASS (API): A, B and C open `/chat/stream`; B sends to A: A and B get `chat-message` (each from their own side), A gets `chat-unread` 1; C gets nothing after its own connect-time `chat-unread`.
  - Clean-up: `remove-ct` refuses a Super Admin and the API refuses removing one's own Super Admin role (OWN_ACCESS_CHANGE), so the `ct_admin` role row was set to status -1 by one SQL update limited to `email = 'ct_admin@ct-test.local'` (1 row), then `test-data/remove-ct confirm` removed 5 accounts, 1 partner, 4 profiles, 1 conversation, 3 notifications; query: 0 ct accounts, partners, wishlist items, profiles, conversations, messages, orphan role rows. Super Admins after: user 1 and user 144, unchanged.
- 2026-11-25: Second review (user's list). Test data `ct_x1` (202), `ct_x2` (203), removed afterwards by `remove-ct confirm` (2 accounts, 2 profiles with their photo folders, 1 conversation, 1 notification); query: 0 ct accounts, profiles, messages.
  - Photo and cover size PASS (API, multipart uploads): the limit is multer's `fileSize`, counted on the bytes received, not on anything the browser states. Photo 256,000 bytes → 200; 256,001 → 422 UPLOAD_REJECTED "Choose a file up to 250 KB."; 307,200 bytes sent as "tiny-10kb.jpg" → 422; the same with a part header `Content-Length: 1000` → 422. Cover 512,000 → 200; 512,001 → 422 "Choose a file up to 500 KB.". A text file named `.png` and a GIF named `.jpg` → 422 PROFILE_IMAGE_TYPE "Choose a JPG, JPEG or PNG file." (checked on the file's first bytes).
  - Script text shown as plain text PASS (browser, 1366 + 390 px): name, Bio, Facebook and a message set to `<script>alert(1)</script>`, About to that plus `<img src=x onerror=alert(2)>`. As the recipient: bell panel, Notifications page, Messages list, the conversation, User Profile; as the sender: account menu, Edit Profile name field, the conversation. Every screen shows the text literally; 0 alerts; 0 `<img src=x>` elements; no `<script>` element of ours: the only script holding the text is Next.js's own data (`self.__next_f.push`), where it is an escaped string (`\u003cscript\u003e`), and the raw HTML has no literal `<script>alert(1)</script>`. The web app has no `dangerouslySetInnerHTML` / `innerHTML`. Console: only the signed-out `401 /auth/refresh` on the sign-in page.
- 2026-11-25: Partner script text PASS (browser, 1366 + 390 px). Through `PUT /api/partner/admin/partners/30` as a `ct_` Super Admin (`ct_xss_admin`, CLI), the demo partner Jungle Trails Safaris got business name and About `<script>alert(1)</script> <img src=x onerror=alert(2)>`. Partner Profile `/partners/30` shows both literally (2x); the package page `/packages/corbett-elephant-trails` shows "Operated by" with the text literally, linking to `/partners/30`; 0 alerts, 0 `<img src=x>` elements, no script element of ours, the raw HTML has neither string unescaped, no console errors. (A first run used a slug that is not live and landed on the home page; re-run on a live package.) Restored through the same route: every field equal to before. Clean-up: the `ct_xss_admin` Super Admin role ended by the documented SQL update (1 row, by its email), `remove-ct confirm` removed the account; partner 30's `updated_at` / `updated_by` set back to `2026-11-16 12:01:13` / 145 by one SQL update on id 30 (the row is now identical to the copy taken before; `audit_log` keeps the four edits, action 1009). Super Admins after: users 1 and 144.

## 6. Post-deploy

### 6.1 Staging: migration before the code (run by the user)

The migration must run **before** the new API code: the new code reads `user_profile` on every shared safari, notification and Sign Up, so code without the tables fails; the tables without the code change nothing (the old code never reads them). The migration only adds four new tables and one `notification_template` row: no DROP, ALTER, UPDATE or DELETE, no existing row changed. Existing users need no row: `date_of_birth` and `gender` are empty for them and are never forced (R219).

1. Back up the staging database: `mysqldump --single-transaction --routines <staging_db> > witw-staging-before-2026-11-24.sql`.
2. Check it is due (all four must return nothing or 0): `SHOW TABLES LIKE 'wishlist_item'; SHOW TABLES LIKE 'user_profile'; SHOW TABLES LIKE 'chat_%'; SELECT COUNT(*) FROM notification_template WHERE notification_kind = 1601 OR code = 'chat_message_received';`. Also check the earlier dated migrations up to `2026-11-16-language-partner-site.sql` are applied.
3. Run it once: `mysql <staging_db> < apps/api/src/database/migrations/2026-11-24-profiles-wishlist-chat.sql`. Run a second time it stops at the first `CREATE TABLE` (table exists) and changes nothing.
4. Check: `SHOW TABLES LIKE 'wishlist_item'` (and `user_profile`, `chat_conversation`, `chat_message`) each return one row; `SELECT notification_kind, code, title_template FROM notification_template WHERE notification_kind = 1601;` returns `1601 | chat_message_received | {{actor}} sent you a message.`.
5. Deploy the code (api, web, partner, manage), build, and restart with pm2 (`environments/ecosystem.stag.config.js`). The API must stay **one process** (fork mode, no `instances`): live messages are handed between open streams in that process's memory.
6. Smoke test: `npm run cli:dist route/list` shows `/api/wishlist`, `/api/profile`, `/api/chat`; on the website a signed-in user opens `/wishlist`, `/my-profile`, `/messages`; an existing user without a profile row signs in and opens a shared safari and the bell without an error.
