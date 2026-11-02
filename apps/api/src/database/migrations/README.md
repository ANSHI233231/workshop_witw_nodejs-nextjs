# Migrations

Hand-written MySQL migrations. There is **no migration runner**: you apply each file yourself.

- The **base set** is six files dated 2026-10-28, one per module that writes the tables: `users-and-auth`, `audit-log`, `app-log`, `mail`, `languages`, `background-jobs` (`.sql`). Together they build a blank database; they do not depend on each other's order.
- Every change after that is a new file here: `YYYY-MM-DD-<short-slug>.sql`, with a short header comment explaining the change and linking its planning file, then the DDL, then the feature's starting rows. Never edit a file once it has been applied.
- The current schema is the base set plus every later file, applied in date order.

Build a blank database, then create the first Super Admin. Back up first when the database is not empty:

```bash
mysql -u root -p -e "CREATE DATABASE <name> CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
for f in src/database/migrations/*.sql; do mysql -u root -p <name> < "$f"; done
npm run cli user/create-super-admin "<name>" <email> <10-digit mobile> confirm
```

The last command prints the new Super Admin's password once; sign in to manage with the email and change it.
