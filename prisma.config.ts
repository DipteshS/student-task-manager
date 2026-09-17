import "dotenv/config";
import { defineConfig } from "prisma/config";

// Read DATABASE_URL directly rather than via prisma/config's `env()` helper,
// which throws at config-load time if the var is unset. That breaks `prisma
// generate` (run from postinstall) in any environment where env vars aren't
// wired up yet when `npm install` runs — `generate` only needs the schema,
// not a live connection, so failing here is unnecessary. `migrate`/`studio`
// still get a real error from Postgres itself if the URL is genuinely wrong.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
