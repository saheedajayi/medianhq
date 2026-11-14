import path from "node:path";
import { defineConfig } from "prisma/config";

// Env vars come from the root scripts, which source .env.local before running Prisma
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
