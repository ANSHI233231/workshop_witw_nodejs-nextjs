# File storage

**What it is.** How uploaded files are kept, where they go, and how an app shows them. Every feature with an upload follows this doc and has its row in the table below.

**Who uses it.** Developers adding an upload to a module.

## Where files live

- The API keeps files through the storage adapter in `apps/api/src/infrastructure/storage/` (`IFileStorage`: `save`, `read`, `remove`, and `removeFolder` for a whole entity folder, used only by the local clean-up commands: `test-data/remove-ct`, `packages-demo/remove` and `local-accounts/remove`; `park-images/remove` deletes single files), built in `server.ts` and handed to `registerRoutes` as `fileStorage`. Modules use only that contract; they never touch the disk or a vendor SDK.
- **`STORAGE_DRIVER=local`** (the only driver today): files are on the API server's disk under **`STORAGE_LOCAL_ROOT`** (`apps/api/.env`, required, no fallback). The default `../../storage` is the `storage/` folder at the repo root. `.gitignore` keeps `/storage/` out of git on every machine and server.
- A file is written to a temporary name and then renamed, so a half-written file is never read. Folders are made when the first file is saved.
- An object store later is one new provider file and an `.env` change; the paths below stay the same.

## The path rule (every upload)

```
<parent folder>/<parent id>/<feature folder>/<row id>/<file_name>
```

- **Folder names are per feature, in `snake_case`**, not table names: one table can hold several kinds of files, so each kind gets its own feature folder.
- The ids are the primary keys of the rows the file belongs to, from the top down; the file sits in the folder of its own row.
- **The database keeps only the file name with its extension** (milliseconds + 16 random hex characters + the real extension), made by the API at upload. The folder is rebuilt in code from the row's ids and a folder constant; a disk path or URL is never stored.

| Feature | Path | Folder constants |
|---|---|---|
| Partner logo | `partner/<partner id>/logo/<file>` | `LOGO_FOLDER` in `modules/partner/types/partner.types.ts`; a new logo replaces the old one, whose file is deleted once the row is saved; shown privately to the applicant and the Super Admin while a request is Pending or Rejected, and publicly (`Cache-Control: public`) once the partner is Active or Inactive ([partner](../modules/partner/README.md)) |
| Gallery photo | `gallery/<gallery id>/<file>` | `GALLERY_FOLDER` in `modules/gallery/types/gallery.types.ts` (the plan's path, #12); shown privately to the owning partner and the Super Admin; files are never overwritten or deleted, and a package copies the files it uses into its own folder ([gallery](../modules/gallery/README.md)) |
| Package image, banner, day image and gallery copy | `package/<package id>/<version number>/<file>` | `PACKAGE_FOLDER` in `modules/package/types/package.types.ts` (the plan's path, #12); a gallery copy is `g<gallery id>-<gallery file>`; Edit on a live package copies the live version's files into the new version's folder; nothing is overwritten or deleted; shown privately to the owning partner and the Super Admin, and publicly (`Cache-Control: public`) only for the live version of a package shown on the website ([package](../modules/package/README.md)) |
| Park feature image | `park/<park id>/feature_image/<file>` | `FEATURE_IMAGE_FOLDER` in `modules/park/types/park.types.ts`; JPG or PNG up to 250 KB; each upload a new file name, and the replaced file is deleted once the row is saved; `park-images/add` fills empty parks with the sample photos from `apps/api/seed/` (local only); shown privately to the Super Admin (any park) and publicly (`Cache-Control: public`) for an active park ([park](../modules/park/README.md)) |
| Shared safari display image | `shared_safari/<safari id>/cover_image/<file>` | `COVER_FOLDER` in `modules/shared-safari/types/shared-safari.types.ts`; a new picture replaces the old one, whose file is deleted once the row is saved; served publicly to anyone who may see the safari (`Cache-Control: public`) ([shared-safari](../modules/shared-safari/README.md)) |

## Receiving uploads

- `fileUpload({ field, maxFiles, maxFileBytes, tooLargeMessage? })` from `core/http` (multer, memory storage) reads a multipart upload before the controller; `uploadedFiles(req)` hands the files to the service. Going over a limit is a 422 `UPLOAD_REJECTED` with a field message.
- A picture's type is checked from its own bytes with `detectImageType` (`core/validation`): JPEG, PNG, GIF, WebP. The file name and the browser's type are not trusted. The form checks the same way in the browser when a picture is chosen.
- **Order:** the rows (and their audit record) are written in one transaction first, to get the row ids for the paths; the files are saved after it commits. If a file cannot be saved, that upload's rows are marked deleted (status -1), the files already saved are removed, and the failure is audited.

## Showing files in an app

- Files are served only through the API, after the same access check as the feature's list, with their type, `Content-Disposition: inline` and `Cache-Control: private, max-age=86400`, by `sendInline()` from `core/http`. A file shown on a public page (the shared safari display image) is sent with `Cache-Control: public` instead, after the same check as that page.
- An `<img>` cannot send the `X-Client-App` header, so the URL carries `?app=<app>`; build it with `apiClient.fileUrl(path, query)`. The API reads `?app=` only for `GET` / `HEAD` and only when the header is missing; the sign-in cookie is still required.
- A picture URL carries `v=<file name>`, so a replaced file gets a new URL.
- A deleted row's file stays on disk (the row keeps status -1). Only a replaced partner logo, shared safari picture or park feature image is deleted from storage; gallery and package files are never overwritten or deleted.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md), [2026-11-04-shared-safari](../../planning/features/2026-11-04-shared-safari.md), [2026-11-12-safari-packages](../../planning/features/2026-11-12-safari-packages.md)
