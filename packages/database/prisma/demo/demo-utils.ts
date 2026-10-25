import { PrismaClient } from "@prisma/client";
import { DEMO_EMAIL_DOMAIN } from "./demo-data";

/**
 * Demo data must never reach a production database: real mentees would see
 * fake mentors. Production deployments set NODE_ENV or APP_ENV to "production".
 */
export function assertNotProduction(action: string) {
  const env = [process.env.APP_ENV, process.env.NODE_ENV].map((v) => v?.toLowerCase());
  if (env.includes("production")) {
    console.error(`Refusing to ${action}: this looks like a production environment.`);
    process.exit(1);
  }

  const url = process.env.DATABASE_URL ?? "";
  const host = url.match(/@([^/:?]+)/)?.[1] ?? "(unknown host)";
  console.log(`${action} on database host: ${host}`);
}

export function demoUserWhere() {
  return { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } };
}

/**
 * Deletes every demo account and everything attached to it, including any
 * bookings or conversations real users had with demo mentors. Real users
 * themselves are never touched.
 */
export async function purgeDemoData(prisma: PrismaClient) {
  const demoUsers = await prisma.user.findMany({
    where: demoUserWhere(),
    select: { id: true, email: true },
  });
  const ids = demoUsers.map((user) => user.id);
  if (ids.length === 0) {
    return { users: 0, bookings: 0, conversations: 0 };
  }

  // Bookings block deleting their mentor or mentee; payments, reviews,
  // sessions and feedback on them are removed by cascade
  const bookings = await prisma.booking.deleteMany({
    where: { OR: [{ mentorId: { in: ids } }, { menteeId: { in: ids } }] },
  });

  const conversations = await prisma.conversation.deleteMany({
    where: { participants: { some: { userId: { in: ids } } } },
  });

  await prisma.verificationToken.deleteMany({
    where: { email: { in: demoUsers.map((user) => user.email) } },
  });

  // Profiles, sessions, availability, earnings and messages cascade from the user
  const users = await prisma.user.deleteMany({ where: { id: { in: ids } } });

  return { users: users.count, bookings: bookings.count, conversations: conversations.count };
}
