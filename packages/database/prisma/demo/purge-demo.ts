/**
 * Removes the demo dataset and everything attached to it, leaving real users alone.
 *
 *   npm run db:purge:demo     (from the repo root)
 */
import { PrismaClient } from "@prisma/client";
import { assertNotProduction, purgeDemoData } from "./demo-utils";

const prisma = new PrismaClient();

async function main() {
  assertNotProduction("Purging demo data");
  const result = await purgeDemoData(prisma);
  console.log(
    `Removed ${result.users} demo accounts, ${result.bookings} bookings and ${result.conversations} conversations.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
