# File storage

**What it is.** How uploaded files are kept, where they go, and how an app shows them. The starter has the storage adapter but no upload yet; the first feature with an upload follows this doc and adds its row to the table below.

**Who uses it.** Developers adding an upload to a module.

## Where files live

- The API keeps files through the storage adapter in `apps/api/src/infrastructure/storage/` (`IFileStorage`: `save`, `read`, `remove`), built in `server.ts` and handed to `registerRoutes` as `fileStorage`. Modules use only that contract; they never touch the disk or a vendor SDK.
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
| (none yet) | | |

## Receiving uploads

- `fileUpload({ field, maxFiles, maxFileBytes, tooLargeMessage? })` from `core/http` (multer, memory storage) reads a multipart upload before the controller; `uploadedFiles(req)` hands the files to the service. Going over a limit is a 422 `UPLOAD_REJECTED` with a field message.
- A picture's type is checked from its own bytes with `detectImageType` (`core/validation`): JPEG, PNG, GIF, WebP. The file name and the browser's type are not trusted. The form checks the same way in the browser when a picture is chosen.
- **Order:** the rows (and their audit record) are written in one transaction first, to get the row ids for the paths; the files are saved after it commits. If a file cannot be saved, that upload's rows are marked deleted (status -1), the files already saved are removed, and the failure is audited.

## Showing files in an app

- Files are served only through the API, after the same access check as the feature's list, with their type, `Content-Disposition: inline` and `Cache-Control: private, max-age=86400`.
- An `<img>` cannot send the `X-Client-App` header, so the URL carries `?app=<app>`; build it with `apiClient.fileUrl(path, query)`. The API reads `?app=` only for `GET` / `HEAD` and only when the header is missing; the sign-in cookie is still required.
- A picture URL carries `v=<file name>`, so a replaced file gets a new URL.
- A deleted file's row stays (status -1) and its file stays on disk.

## History

- Planning files: [2026-10-28-starter-core](../../planning/features/2026-10-28-starter-core.md)
