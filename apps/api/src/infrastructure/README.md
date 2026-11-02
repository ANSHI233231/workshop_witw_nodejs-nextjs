# infrastructure/

Adapters to things outside the process: email, SMS, payment gateways, file storage, queues, cache. Business modules never import a vendor SDK. They depend on a small **contract** (interface) from here, so a provider can be swapped (SMTP → SES, local disk → S3) by changing one folder and one `.env` value.

| Capability | Folder | Status |
|---|---|---|
| Email | `email/` | built: `IEmailSender`, driver `capture` (records, sends nothing); see [modules/mail](../../../../docs/how-it-works/modules/mail/README.md) |
| SMS / OTP | `sms/` | not built |
| Payment gateway | `payment/` | not built |
| File storage | `storage/` | built: `IFileStorage`, driver `local` (files under `STORAGE_LOCAL_ROOT`, default the repo's `storage/`); path rule and use: [file-storage.md](../../../../docs/how-it-works/platform/file-storage.md) |
| Background jobs | the `jobs` module (a database queue; [background-jobs](../../../../docs/how-it-works/platform/background-jobs.md)); `queue/` stays for an outside queue service, not built |
| Running commands | `process/` | built: `ICommandRunner`, the CLI in a child process without a shell (used by the jobs worker) |
| Cache | `cache/` | not built |

Add a new capability (push notifications, maps, PDF generation …) as a new folder following the same pattern.

## Folder pattern

```
infrastructure/<capability>/
├── index.ts                        Public surface: exports the contract types and the factory, nothing else
├── <capability>.contract.ts        The interface modules depend on (IEmailSender, IPaymentGateway …),
│                                   written in business terms, never in one vendor's terms
├── create-<capability>.ts          Factory: picks the provider from options, e.g. createEmailSender({ driver: 'smtp', … })
└── providers/
    ├── <provider>.provider.ts      One file per vendor, implementing the contract (smtp.provider.ts, <gateway>.provider.ts)
    └── log.provider.ts             Optional: a no-network provider for development that only logs what it would send
```

Only create what you need: a capability with one provider still gets the contract and the factory, so the second provider is a new file and not a rewrite.

## Rules

- **Modules depend on the contract, never on a provider or an SDK.** Import from the capability's `index.ts` only (enforced by `npm run lint`).
- **Configuration comes in from the entry point.** Each capability's variables (`EMAIL_DRIVER`, `SMTP_HOST`, `PAYMENT_KEY_ID` …) are added to `src/config/environment.schema.ts` and `.env.example`. `server.ts` reads them and calls the factory. An adapter never reads `config/` or `process.env` itself, and a secret never has a fallback value.
- **Adapters are built once, in `server.ts`**, and injected: `server.ts` → `registerRoutes({ db, emailSender, … })` → `createXModule({ emailSender })`. The CLI builds the ones its commands need the same way.
- **No HTTP decisions here.** An adapter throws plain errors (e.g. `PaymentDeclinedError`) or returns results; the calling module's service decides what that means for the API response.
- **No business logic here.** "Send the booking confirmation email" belongs in a module; "send an email" belongs here.
- **Log, never leak.** Log provider failures through `core/logger`, but never log secrets, card data, OTPs or full message bodies.
- **Webhooks** (e.g. payment callbacks) are routes, so they live in the module that owns the business meaning (e.g. a payment gateway's webhook in the module that owns orders). That module uses the adapter here to verify the signature.
