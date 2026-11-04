# Shared Safari: changes for the prototype

Decisions made after the prototype (`docs/prototype` at 02ae9a4, git@github.com:umang-lgtm/workshop_witw_prototype.git) that the prototype doesn't show yet. Each item names its board, what to change, and the decision in the [Shared Safari workflow](../../how-it-works/workflows/WITW-Shared-Safari-Workflow.md) §13. The prototype is changed in its own repository, never from this one; when an item is done there and the pin moves, it is ticked here and its row in [PROTOTYPE-SYNC](../../PROTOTYPE-SYNC.md) re-checked.

Plan: [2026-11-04-shared-safari](../features/2026-11-04-shared-safari.md).

## Website

### Web-Sign-Up (#12)

- [ ] Add **Mobile Number** (required) between Email and Password.
- [ ] Errors: "Enter a 10-digit mobile number." (10 digits starting 6–9) · "An account with this mobile number already exists."
- [ ] No other change: Sign Up gives no role; the user is signed in and lands on Shared Safaris.

### W5 Organise a Safari / Edit (#11)

- [ ] **Edit:** check the start-date rule ("Choose a start date from today up to one year ahead.") only when the start date is changed. A started or over safari with its start date unchanged saves. "End date must be after the start date." is always checked. Today the board checks the start date on every save, so a started safari can't be saved.
- [ ] Allow **Edit** from My Shared Safaris › Organised for started and over safaris (#6).
- [ ] **Edit with an inactive park:** the park field shows the safari's current park even though it is now inactive; Save asks the host to pick an active park (#32).

### W3 Shared Safari view, discussion (#9, #16, #17, #25, #26, #43)

- [ ] **Own comments:** an **Edit** (pencil) and **Delete** (bin) icon on the viewer's own comment or reply, with tooltips, next to where others' comments have the flag icon.
  - Also on a **started** safari (#25).
  - Edit: the text in a box with **Save** / **Cancel**, the same rules ("Enter a comment." · "Please provide content within 200 words."). No "edited" mark (#26).
  - Delete: the comment leaves the discussion and **its replies are hidden with it**; deleting a reply removes only that reply. It happens at once, with no confirmation (#26).
- [ ] **Member who left:** their comments and replies stay, and they **can still post** comments and replies (the comment box stays for them). Only someone who never joined sees "Join this safari to comment." (Add a "View as" state for a member who left, so this is visible.)
- [ ] **Flag again:** a user can flag the same comment again; each flag counts in C4 (no "already flagged" block). The board already allows it; keep it.
- [ ] **Flag dialog:** details up to 500 characters, "Use up to 500 characters." (#35, #56); the flag icon also on a started safari's comments (#34; the board hides it there today).
- [ ] **Own comments after leaving:** no Edit / Delete icons once the writer has left (#43); they can still post.

### W1 / W3 / W9 Started safari (#33, #44–#46)

- [ ] A started safari works like any other: it **stays on W1** (the list), its view keeps **Join Safari** / **Leave Safari** (Seat full still hides Join) and the **comment box** (#33, #44, #45). Check the board's started state, which today is read-only with "This safari has already started."
- [ ] **W9 › Joined** shows every joined safari whatever its status except Inactive and deleted, upcoming and started; a started one marked "Over", as in Organised (#46, #57).
- [ ] **W1:** a safari whose **end date** has passed leaves the list; its view still opens from its link (#47). Starting soonest / latest and Month use the start date, started safaris included (#48).

### W3 / W9 Host's own Inactive safari (#22)

- [ ] The host opening their own Inactive safari from My Shared Safaris › Organised sees its view page (status badge, Update Safari, Change Status), not "This safari is not available." Others still get "not available". Today the board shows "not available" to the host too.

### Web-Notifications (#14)

- [ ] Show the Shared Safari notifications: "{name} joined your safari {title}." and "{name} commented on your safari {title}.", each opening the safari, with a **Shared Safari** tag (and tab), together with the existing Account ones. The board shows only Account sample notifications today.
- [ ] Put the page in the WITW frame (header, banner, footer), as the Shared Safari boards; it uses the old portal frame today.

### Web-Not-Found (§12)

- [ ] Put the page in the WITW frame.

### Deactivated host and member (#18, #51, #52, #54)

- [ ] A sample safari whose host is deactivated: hidden from W1, its view link shows "This safari is not available.", and it is not in a member's **W9 › Joined** (#51). (Optional; a "State" option on W1 / W3 / W9 is enough.)
- [ ] A deactivated member: their comments, replies and flags are not shown, and they are left out of **Interested** (initials, popup) and every **joined count** ("N joined", "Interested – N") (#52, #54).

### W5 Display image (#21)

- [ ] Show the limit "PNG, JPG or JPEG, up to 5 MB"; refuse another type, "Use a PNG, JPG or JPEG image." (#58), and a larger file, "Use an image up to 5 MB." (#56). The image is kept as uploaded, not resized (#27).

## Console

### C1 Shared Safaris list (#5)

- [ ] Status filter: remove **Live**; **All** by default; add **Deleted by host** after Deleted by admin (#5, #55).
- [ ] A deleted safari (by host or admin) **keeps its pin** (#42).
- [ ] A sample host-deleted safari.

### C3 Shared Safari detail (#5, #10, #15, #38, #53)

- [ ] **Host-deleted safari:** shows "Deleted by host" with when it was deleted; **read-only**: no Make active, Pin / Unpin, Delete or comment delete.
- [ ] **Left tab** (and C2 Left list): one line per member with their last leave time (as today); no history.
- [ ] **Delete a single reply** in the detail (#38), as well as a comment with its replies.
- [ ] **Hidden replies:** the replies under a comment its writer deleted are not shown here either (#53).

### C4 Flagged Comments (#49, #50, #52)

- [ ] Show the comment's current text after its writer edits it; drop a comment (and its replies' flags) its writer deleted; hide everything by a deactivated user.

### C5 / C6 Parks (#41, #62)

- [ ] **Upcoming safaris** (the list's column and the detail's list): Active and Seat full safaris starting today or later.
- [ ] **Add / Edit Park:** the min. and max. price up to ₹10,00,000, "Enter whole rupees, up to ₹10,00,000." (no upper limit on the board today).

### C7 Flag Reasons (#36, #37)

- [ ] No reordering: reasons in the order they were added (a new one after "Other"); "Used in flags" counts every flag, open or closed.

## Both

- [ ] `prototype/README.md` still says 22 boards and lists Web-Welcome and Web-Dashboard; the prototype has 37 boards (PROTOTYPE-SYNC P2).
- [ ] Forgot Password (#20): no change on the boards; the Delivery Log already shows the reset email as "Captured (not sent)".
