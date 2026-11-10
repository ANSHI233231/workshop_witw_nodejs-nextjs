# Flag Reason (Flag Reasons master)

**What it is.** The reasons a signed-in user picks from when flagging a Shared Safari comment or reply ("Flag this comment"). The Super Admin keeps the list in the console. The table is `master_flag_reason` (written only by this module); it starts with 8 reasons: Abusive or Illegal · Commercial or Spam · Dating / Sexually Explicit · Felt Unsafe · Shows My Private Information · Violates Guidelines · Off Topic · Other.

**Who uses it.** The Super Admin (manage › Shared Safari › Flag Reasons, `/flag-reasons`, board C7). Signed-in website users see the active reasons in the Flag dialog.

## The flow

1. **List** (`/flag-reasons`): S.No · Reason · Used in flags · Status · Actions, in the order the reasons were added (by id; there is no sort order and no reordering, a new reason comes last). The whole list is shown, without pages, with Total Items. Filters: reason search and Status (All / Active / Inactive); **Clear filters** shows while a filter is set. On a phone (below 768 px) each reason is a card ("1. Reason", status badge, "Used in N flags", the actions).
2. **Used in flags** counts every flag ever raised with the reason (`shared_safari_comment_flag.master_flag_reason_id`), open or closed.
3. **Add Reason**: the reason only (up to 60 characters). A new reason is Active. After adding, the filters are cleared so the new reason shows last. Toast: `Reason "<name>" added.`
4. **Edit** (pencil icon): the reason and a Status switch (Active / Inactive); the switch is only in Edit. Toast: `Reason "<name>" updated.`
5. **Make active / Make inactive** (switch icon, tooltip says which): changes the status at once. Toast: `Reason "<name>" is now active.` / `… is now inactive.`
6. **Flag dialog**: `GET /api/flag-reason/active` gives the active reasons (`{ id, name }`) in the order they were added. The shared-safari module reads them through `IFlagReasonService.listActive()` and checks a chosen reason with `findActiveById(id)`.

## Rules

- **Messages** (API and form say the same): "Enter the reason." · "Use up to 60 characters." · "This reason already exists." (`FLAG_REASON_NAME_TAKEN`; not case-sensitive, from the column's collation).
- **No delete.** A reason is made inactive instead. An inactive reason is hidden from the Flag dialog.
- **Past flags keep their reason:** a flag stores the reason's name when it is raised (`reason_name`), so renaming or deactivating a reason doesn't change past flags; Used in flags still counts them by id.
- **Access:** `GET /api/flag-reason/active` needs a signed-in user; every other route is Super Admin only (console area `platform`).
- **Audit:** add 831 (832 failed), edit 833 (834), status 835 (836), entity Flag reason (11), with what changed.

## Where it lives

- API: `apps/api/src/modules/flag-reason/` (`GET /api/flag-reason`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `GET /active`)
- Console: `apps/manage/src/app/(dashboard)/flag-reasons/`, `components/flag-reasons/`, `services/flag-reason.service.ts`, `types/flag-reason.types.ts`
- Table: `apps/api/src/database/migrations/2026-11-04-shared-safari.sql`
- Plan: [2026-11-04-shared-safari](../../../planning/features/2026-11-04-shared-safari.md) · Workflow: [WITW Shared Safari](../../workflows/WITW-Shared-Safari-Workflow.md) §11.4
