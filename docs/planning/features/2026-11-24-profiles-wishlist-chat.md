# Profiles, Wishlist and Direct Chat

| Field | Value |
|---|---|
| Status | proposed |
| Started | 2026-11-24 |
| Shipped | |
| Apps | api / web / partner (one link) |
| Test cases | TC-WL-01..10, TC-PROF-01..14, TC-CHAT-01..12, TC-PTNR-01..05 |
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
2. **Boards ready.** The user declares U1–U5 and the PROTOTYPE-SYNC §2.1 changes ready; their Ready cells get the commit and date.
3. **Questions settled** (§2.8): workflow #1–#4, #8, #9 and plan Q1 (live delivery), Q2 (addresses) before the API is written; the texts (workflow #5, #6) before the screens; PROTOTYPE-SYNC D3 (file upload box) before any file field is touched.
4. **Migration written and applied.** `2026-11-24-profiles-wishlist-chat.sql` (§2.3) written; applied to the local database by the user (or by the agent after the user approves), then checked.

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

### 2.3 Schema (proposed, to confirm with the user)

`2026-11-24-profiles-wishlist-chat.sql`:

- `wishlist_item`: `id`, `user_id`, `item_type` (TINYINT, `WishlistItemType`), `package_id` / `shared_safari_id` (one set), `saved_price_per_person` (the package's price when saved, for the come-back rule, workflow #2), `is_hidden` (dropped out while the package is not shown), `status`, `created_at` (the "saved" time: newest first), audit columns. Unique per user and item; indexes on `user_id`, `package_id`, `shared_safari_id`.
- `user_profile`: `user_id` (one row per user), `date_of_birth` (DATE, NULL for existing users), `gender` (TINYINT NULL), `bio` and `about` (TEXT: no length limit, workflow §3.1), `facebook_url`, `x_url`, `instagram_url`, `youtube_url` (VARCHAR(1000) NULL), `photo`, `cover_photo` (stored file keys, NULL = placeholder), audit columns.
- `chat_conversation`: `id`, `user_id_low`, `user_id_high` (unique pair: one conversation per two users), `last_message_at`, audit columns. (Two pointers at `user` cannot both be `user_id`; the names are a proposal, to confirm with the user against convention 3.)
- `chat_message`: `id`, `chat_conversation_id`, `sender_user_id`, `message_text` (VARCHAR(1000), workflow #7), `read_at` (NULL = unread), `created_at`. No edit, no delete (workflow §5).

### 2.4 Screens (website, from U1–U5)

| Board | Route (proposed, Q2) | What it does |
|---|---|---|
| U1 Wishlist | `/wishlist` | Tabs Packages (default) / Shared Safaris; P1 package card with the heart, W1 safari card; newest saved first; 6 at a time, Load More; "No Packages available" / "No Shared Safaris available". Guest → Login; partner → no page |
| U2 Partner Profile | `/partners/[id or slug]` | Header (logo or WITW default logo, business name, About, tiles Packages / Parks opening their tab); tabs Packages (shown packages, cards with the heart) / Parks (active parks, P5 card); 12 at a time, Load More; "No packages available" / "No parks available"; inactive or unknown → home page. No phone or email |
| U3 User Profile | `/users/[id or slug]` | Cover, picture, name; Edit Profile (own) / Message (someone else's, not for a partner viewer); tabs Profile (Bio, About, Social links, "–" when empty) / Shared Safaris (organised and joined, active on the website now); guest: header only and "Please sign in to view the full profile." with Sign in (`/login?next=…`); inactive, unknown, or a partner's account → home page (a partner opens U2) |
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
- **P3:** Travellers centred, card shadow (style only).
- **File upload box (D3):** only if the user decides it (PROTOTYPE-SYNC D3); then every file field in every app changes in the same change.

### 2.6 Live messages

The workflow asks for new messages to arrive without refreshing (*user, 2026-11-20*). The repo has no live channel today (no WebSocket or server-sent events). Options (Q1), to be decided by the user before building: polling the open conversation and the unread count every few seconds (no new infrastructure); server-sent events from the API (one new response helper in `core/http`, connections kept open per signed-in tab); or WebSocket (new infrastructure adapter, more moving parts).

### 2.7 Docs

- Write `docs/how-it-works/modules/wishlist/`, `profile/`, `chat/`; update `users`, `notification`, `partner`, `shared-safari`, `package` module docs and the website frame doc.
- The workflow `.md` is the user's: the §9 answers go there by the user (or by the agent when asked). It is not in the docx generator's list, so it has no `.docx`.
- PROTOTYPE-SYNC: U1–U5 rows and the §2.1 changes move into the board rows as each screen is built.

### 2.8 Open questions

From the workflow §9 (not answered). The prototype suggests an answer for some; these are **not decisions** until the user confirms them.

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

## 5. Execution log

- 2026-11-24: Plan written. Read the workflow (2026-11-24 answers, §9 #8 and #9 new) and the prototype checkout: 5d1b27e (pushed, design system) plus uncommitted canvas version 38, every board diffed with the pin 1bdd8df: 44 board files changed (the partner account menu, Organize and Join hidden for a partner), recorded in PROTOTYPE-SYNC (header, D2, §2.1 rows marked v38, plan links moved here). The 2026-11-23 plan deleted. No code, no migration yet; waiting on the §2.1 gates.
- 2026-11-24: Canvas version 38 committed in the prototype repository as 79b0567, pushed, and the pin moved to it (user: "commit and push my all ground work"). Gate 1 done; PROTOTYPE-SYNC header, D1, D2 and §2.1 updated.

## 6. Post-deploy
