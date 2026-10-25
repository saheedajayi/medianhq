/**
 * Seeds the demo dataset: approved mentors with sessions and availability,
 * mentees, bookings in every state, reviews, earnings and conversations.
 *
 *   npm run db:seed:demo     (from the repo root)
 *
 * Safe to re-run: existing demo data is purged first, so dates are always
 * relative to now (an "upcoming" session is always upcoming). Refuses to run
 * against production. Demo accounts sign in with DEMO_PASSWORD.
 */
import { randomBytes, scryptSync } from "crypto";
import {
  BookingStatus,
  MentorStatus,
  PaymentStatus,
  PrismaClient,
  UserRole,
  type MentorSession,
} from "@prisma/client";
import {
  DEMO_CONVERSATIONS,
  DEMO_EMAIL_DOMAIN,
  DEMO_MENTEES,
  DEMO_MENTEE_REVIEWS,
  DEMO_MENTOR_FEEDBACK,
  DEMO_MENTORS,
  DEMO_PASSWORD,
  DEMO_SESSION_PACKAGES,
} from "./demo-data";
import { assertNotProduction, purgeDemoData } from "./demo-utils";

const prisma = new PrismaClient();
const now = new Date();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
// Demo mentors are in Nigeria; times are set in West Africa Time (UTC+1)
const WAT_OFFSET_MS = 60 * MINUTE;

/** Same format the API's auth service uses: scrypt:<salt>:<hash> */
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/** A WAT wall-clock time, dayOffset days from today */
function watAt(dayOffset: number, hour: number, minute = 0) {
  const watNow = new Date(now.getTime() + WAT_OFFSET_MS);
  const utc = Date.UTC(
    watNow.getUTCFullYear(),
    watNow.getUTCMonth(),
    watNow.getUTCDate() + dayOffset,
    hour,
    minute,
  );
  return new Date(utc - WAT_OFFSET_MS);
}

/** Within the next few minutes, on a 5-minute boundary, so the video room is already open */
function startingSoon(minutes: number) {
  const target = now.getTime() + minutes * MINUTE;
  return new Date(Math.ceil(target / (5 * MINUTE)) * 5 * MINUTE);
}

function earnings(gross: number) {
  if (gross <= 0) return null;
  const platformFee = Math.min(gross, Math.round(gross * 0.04) + 100);
  return { grossAmount: gross, platformFee, amount: gross - platformFee };
}

type BookingSeed = {
  mentor: string;
  mentee: string;
  session: "Get to Know You" | "CV Review" | "Career Positioning";
  startsAt: Date;
  status: BookingStatus;
  notes?: string;
  respondBy?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: UserRole;
  cancellationReason?: string;
  mentorJoined?: boolean;
  menteeJoined?: boolean;
  noShowParty?: "MENTOR" | "MENTEE" | "BOTH";
  /** Fraction of the price refunded (1 = full) */
  refund?: number;
  /** Mentor keeps this fraction of the price as earnings */
  earn?: number;
  menteeReview?: { rating: number; comment: string };
  mentorFeedback?: boolean;
};

async function main() {
  assertNotProduction("Seeding demo data");

  const purged = await purgeDemoData(prisma);
  if (purged.users > 0) {
    console.log(`Removed previous demo data (${purged.users} accounts, ${purged.bookings} bookings).`);
  }

  const passwordHash = hashPassword(DEMO_PASSWORD);
  // The purge finds demo accounts by their domain, so an email outside it would be left behind
  const offDomain = [...DEMO_MENTORS, ...DEMO_MENTEES].filter(
    (person) => !person.email.endsWith(`@${DEMO_EMAIL_DOMAIN}`),
  );
  if (offDomain.length > 0) {
    throw new Error(
      `Demo emails must end with @${DEMO_EMAIL_DOMAIN}: ${offDomain.map((p) => p.email).join(", ")}`,
    );
  }

  // --- Mentors, their sessions and weekly availability ------------------------
  const mentorIds = new Map<string, string>();
  const mentorSessions = new Map<string, Map<string, MentorSession>>();

  for (const mentor of DEMO_MENTORS) {
    const user = await prisma.user.create({
      data: {
        email: mentor.email,
        passwordHash,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        role: UserRole.MENTOR,
        emailVerifiedAt: now,
        mentorProfile: {
          create: {
            headline: `${mentor.jobTitle} @ ${mentor.company}`,
            jobTitle: mentor.jobTitle,
            company: mentor.company,
            location: mentor.location,
            industry: mentor.industry,
            experience: mentor.experience,
            bio: mentor.bio,
            motivation: "I want to help the next generation of African professionals grow faster than I did.",
            avatarUrl: mentor.avatarUrl,
            linkedinUrl: `https://www.linkedin.com/in/${mentor.firstName}-${mentor.lastName}`.toLowerCase(),
            pricePerSession: mentor.price,
            currency: "NGN",
            status: MentorStatus.APPROVED,
          },
        },
      },
    });
    mentorIds.set(mentor.key, user.id);

    const sessions = new Map<string, MentorSession>();
    for (const pkg of DEMO_SESSION_PACKAGES) {
      const session = await prisma.mentorSession.create({
        data: {
          mentorId: user.id,
          title: pkg.title,
          description: pkg.description,
          durationMinutes: pkg.durationMinutes,
          price: pkg.pricing === "free" ? 0 : mentor.price,
          currency: "NGN",
          type: "ONE_ON_ONE",
          isLive: true,
        },
      });
      sessions.set(pkg.title, session);
    }
    mentorSessions.set(mentor.key, sessions);

    if (mentor.availableDays.length > 0) {
      await prisma.weeklyAvailability.createMany({
        data: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          mentorId: user.id,
          dayOfWeek,
          startTime: mentor.startTime,
          endTime: mentor.endTime,
          isActive: mentor.availableDays.includes(dayOfWeek),
        })),
      });
    }
  }

  // --- Mentees ----------------------------------------------------------------
  const menteeIds = new Map<string, string>();
  for (const mentee of DEMO_MENTEES) {
    const user = await prisma.user.create({
      data: {
        email: mentee.email,
        passwordHash,
        firstName: mentee.firstName,
        lastName: mentee.lastName,
        role: UserRole.MENTEE,
        emailVerifiedAt: now,
        menteeProfile: {
          create: {
            avatarUrl: mentee.avatarUrl,
            currentRole: mentee.currentRole,
            industry: mentee.industry,
            goals: mentee.goals,
            goalDescription: mentee.goalDescription,
            timeframe: mentee.timeframe,
          },
        },
      },
    });
    menteeIds.set(mentee.key, user.id);
  }

  // --- Bookings ---------------------------------------------------------------
  const bookings: BookingSeed[] = [
    // Hannah (mentee) and Abdulrahman (mentor) see every state from both sides
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "Career Positioning",
      startsAt: startingSoon(10),
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(now.getTime() - 2 * 24 * HOUR),
      notes: "I'd like to review my positioning and resume narrative for Senior PM roles.",
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "CV Review",
      startsAt: watAt(2, 10),
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(now.getTime() - 24 * HOUR),
      notes: "Looking for direct feedback on two case study summaries on my CV.",
    },
    {
      mentor: "chidinma",
      mentee: "hannah",
      session: "Get to Know You",
      startsAt: watAt(6, 15),
      status: BookingStatus.CONFIRMED,
      confirmedAt: new Date(now.getTime() - 3 * HOUR),
      notes: "Exploring a move into data engineering.",
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "CV Review",
      startsAt: watAt(3, 11),
      status: BookingStatus.PENDING_CONFIRMATION,
      respondBy: new Date(now.getTime() + 20 * HOUR),
      notes: "I've been job hunting for a while and I've not gotten positive results. I'd like to know the things I'm doing wrong.",
    },
    {
      mentor: "abdulrahman",
      mentee: "amara",
      session: "Career Positioning",
      startsAt: watAt(4, 14),
      status: BookingStatus.PENDING_CONFIRMATION,
      respondBy: new Date(now.getTime() + 5 * HOUR),
      notes: "Line-by-line audit of my executive summary and bullet points.",
    },
    {
      mentor: "femi",
      mentee: "hannah",
      session: "Get to Know You",
      startsAt: watAt(5, 12),
      status: BookingStatus.PENDING_CONFIRMATION,
      respondBy: new Date(now.getTime() + 14 * HOUR),
      notes: "Curious about moving from analytics into corporate finance.",
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "CV Review",
      startsAt: watAt(-3, 10),
      status: BookingStatus.COMPLETED,
      mentorJoined: true,
      menteeJoined: true,
      earn: 1,
      menteeReview: DEMO_MENTEE_REVIEWS[1],
      mentorFeedback: true,
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "Career Positioning",
      startsAt: watAt(-10, 14),
      status: BookingStatus.COMPLETED,
      mentorJoined: true,
      menteeJoined: true,
      earn: 1,
      menteeReview: DEMO_MENTEE_REVIEWS[3],
      // No mentor feedback yet: the mentor sees "Write a review"
    },
    {
      mentor: "chidinma",
      mentee: "hannah",
      session: "Career Positioning",
      startsAt: watAt(-6, 16),
      status: BookingStatus.COMPLETED,
      mentorJoined: true,
      menteeJoined: true,
      mentorFeedback: true,
      // No mentee review yet: the mentee sees "Review mentor"
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "Career Positioning",
      startsAt: watAt(8, 10),
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(now.getTime() - 24 * HOUR),
      cancelledBy: UserRole.MENTEE,
      cancellationReason: "Schedule conflict: a last-minute work trip.",
      refund: 1,
    },
    {
      mentor: "tunde",
      mentee: "hannah",
      session: "CV Review",
      startsAt: watAt(9, 11),
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(now.getTime() - 5 * HOUR),
      cancelledBy: UserRole.MENTOR,
      cancellationReason: "Emergency: an all-hands meeting was moved to this time.",
      refund: 1,
    },
    {
      mentor: "folake",
      mentee: "hannah",
      session: "Career Positioning",
      startsAt: watAt(7, 16),
      status: BookingStatus.DECLINED,
      cancelledAt: new Date(now.getTime() - 10 * HOUR),
      cancelledBy: UserRole.MENTOR,
      cancellationReason: "Outside my expertise: I'd recommend a product-focused mentor.",
      refund: 1,
    },
    {
      mentor: "abdulrahman",
      mentee: "amara",
      session: "Get to Know You",
      startsAt: watAt(-1, 12),
      status: BookingStatus.EXPIRED,
      respondBy: watAt(-1, 12),
      cancelledAt: watAt(-1, 12),
    },
    {
      mentor: "abdulrahman",
      mentee: "hannah",
      session: "CV Review",
      startsAt: watAt(-14, 15),
      status: BookingStatus.NO_SHOW,
      menteeJoined: true,
      noShowParty: "MENTOR",
      refund: 1,
    },
    {
      mentor: "abdulrahman",
      mentee: "marcus",
      session: "CV Review",
      startsAt: watAt(-12, 11),
      status: BookingStatus.NO_SHOW,
      mentorJoined: true,
      noShowParty: "MENTEE",
      earn: 1,
    },
  ];

  // Every mentor gets a few past sessions with reviews, so ratings are real
  const reviewers = DEMO_MENTEES.map((mentee) => mentee.key);
  DEMO_MENTORS.forEach((mentor, mentorIndex) => {
    const reviewCount = mentor.key === "amina" ? 5 : 2 + (mentorIndex % 3);
    for (let i = 0; i < reviewCount; i += 1) {
      bookings.push({
        mentor: mentor.key,
        mentee: reviewers[(mentorIndex + i) % reviewers.length]!,
        session: i % 2 === 0 ? "CV Review" : "Career Positioning",
        startsAt: watAt(-(15 + i * 6 + mentorIndex), 10 + (i % 5)),
        status: BookingStatus.COMPLETED,
        mentorJoined: true,
        menteeJoined: true,
        earn: 1,
        menteeReview: DEMO_MENTEE_REVIEWS[(mentorIndex + i) % DEMO_MENTEE_REVIEWS.length],
        mentorFeedback: i === 0,
      });
    }
  });

  // Every other mentor, and every mentee, also gets upcoming, pending and cancelled
  // bookings, so each demo account has something in all four booking tabs
  const otherMentees = DEMO_MENTEES.map((m) => m.key).filter((key) => key !== "hannah");
  const cancelledVariants: Partial<BookingSeed>[] = [
    {
      status: BookingStatus.CANCELLED,
      cancelledBy: UserRole.MENTEE,
      cancellationReason: "Schedule conflict: something came up at work.",
      refund: 1,
    },
    {
      status: BookingStatus.CANCELLED,
      cancelledBy: UserRole.MENTOR,
      cancellationReason: "Emergency: I'm travelling unexpectedly that day.",
      refund: 1,
    },
    {
      status: BookingStatus.DECLINED,
      cancelledBy: UserRole.MENTOR,
      cancellationReason: "Not available at this time: please pick another slot.",
      refund: 1,
    },
    { status: BookingStatus.EXPIRED },
  ];
  DEMO_MENTORS.filter((mentor) => mentor.key !== "abdulrahman").forEach((mentor, index) => {
    const startHour = Number(mentor.startTime.split(":")[0]) + (mentor.startTime.includes("PM") ? 12 : 0);
    const mentee = (offset: number) => otherMentees[(index + offset) % otherMentees.length]!;
    const variant = cancelledVariants[index % cancelledVariants.length]!;

    bookings.push(
      {
        mentor: mentor.key,
        mentee: mentee(0),
        session: "CV Review",
        startsAt: watAt(2 + (index % 5), startHour),
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(now.getTime() - 24 * HOUR),
        notes: "Looking for honest feedback on how my CV reads to recruiters.",
      },
      {
        mentor: mentor.key,
        mentee: mentee(1),
        session: "Career Positioning",
        startsAt: watAt(8 + (index % 4), startHour + 1),
        status: BookingStatus.PENDING_CONFIRMATION,
        respondBy: new Date(now.getTime() + (6 + index) * HOUR),
        notes: "I'd like help planning my next career move.",
      },
      {
        mentor: mentor.key,
        mentee: mentee(2),
        session: "Get to Know You",
        startsAt: watAt(variant.status === BookingStatus.EXPIRED ? -2 : 10 + (index % 3), startHour),
        cancelledAt: new Date(now.getTime() - (3 + index) * HOUR),
        respondBy: variant.status === BookingStatus.EXPIRED ? watAt(-2, startHour) : undefined,
        ...variant,
      } as BookingSeed,
    );
  });

  for (const seed of bookings) {
    const mentorId = mentorIds.get(seed.mentor)!;
    const menteeId = menteeIds.get(seed.mentee)!;
    const session = mentorSessions.get(seed.mentor)!.get(seed.session)!;
    const endsAt = new Date(seed.startsAt.getTime() + session.durationMinutes * MINUTE);

    const booking = await prisma.booking.create({
      data: {
        mentorId,
        menteeId,
        mentorSessionId: session.id,
        title: session.title,
        startsAt: seed.startsAt,
        durationMinutes: session.durationMinutes,
        status: seed.status,
        notes: seed.notes ?? null,
        meetingUrl: "/mentee/booking-session",
        respondBy: seed.respondBy ?? null,
        confirmedAt: seed.confirmedAt ?? null,
        cancelledAt: seed.cancelledAt ?? null,
        cancelledBy: seed.cancelledBy ?? null,
        cancellationReason: seed.cancellationReason ?? null,
        mentorJoinedAt: seed.mentorJoined ? seed.startsAt : null,
        menteeJoinedAt: seed.menteeJoined ? seed.startsAt : null,
        noShowParty: seed.noShowParty ?? null,
        createdAt: new Date(Math.min(seed.startsAt.getTime(), now.getTime()) - 3 * 24 * HOUR),
      },
    });

    if (session.price > 0) {
      const refundAmount = seed.refund ? Math.round(session.price * seed.refund) : null;
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: session.price,
          currency: session.currency,
          // Demo references never reach Paystack
          providerReference: `DEMO_${booking.id}`,
          status: refundAmount ? PaymentStatus.REFUNDED : PaymentStatus.SUCCESSFUL,
          refundAmount,
          refundStatus: refundAmount ? "PROCESSED" : null,
          refundedAt: refundAmount ? seed.cancelledAt ?? endsAt : null,
        },
      });

      const earning = seed.earn ? earnings(Math.round(session.price * seed.earn)) : null;
      if (earning) {
        await prisma.mentorEarning.create({
          data: { mentorId, bookingId: booking.id, currency: session.currency, ...earning },
        });
      }
    }

    if (seed.status === BookingStatus.COMPLETED) {
      await prisma.session.create({
        data: { bookingId: booking.id, completedAt: endsAt, completedMinutes: session.durationMinutes },
      });
    }

    if (seed.menteeReview) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          authorId: menteeId,
          rating: seed.menteeReview.rating,
          comment: seed.menteeReview.comment,
          createdAt: endsAt,
        },
      });
    }

    if (seed.mentorFeedback) {
      await prisma.menteeFeedback.create({
        data: {
          bookingId: booking.id,
          authorId: mentorId,
          rating: DEMO_MENTOR_FEEDBACK.rating,
          comment: DEMO_MENTOR_FEEDBACK.comment,
          actionItems: DEMO_MENTOR_FEEDBACK.actionItems,
          followUpNotes: DEMO_MENTOR_FEEDBACK.followUpNotes,
        },
      });
    }
  }

  // --- Conversations ----------------------------------------------------------
  for (const conversation of DEMO_CONVERSATIONS) {
    const menteeId = menteeIds.get(conversation.mentee)!;
    const mentorId = mentorIds.get(conversation.mentor)!;
    const lastMessageAt = new Date(
      now.getTime() - Math.min(...conversation.messages.map((m) => m.minutesAgo)) * MINUTE,
    );

    await prisma.conversation.create({
      data: {
        updatedAt: lastMessageAt,
        participants: { create: [{ userId: menteeId }, { userId: mentorId }] },
        messages: {
          create: conversation.messages.map((message, index) => ({
            senderId: message.from === "mentee" ? menteeId : mentorId,
            content: message.content,
            // The latest message is left unread so the inbox shows an unread count
            isRead: index < conversation.messages.length - 1,
            createdAt: new Date(now.getTime() - message.minutesAgo * MINUTE),
          })),
        },
      },
    });
  }

  console.log(
    `Seeded ${DEMO_MENTORS.length} mentors, ${DEMO_MENTEES.length} mentees, ` +
      `${bookings.length} bookings and ${DEMO_CONVERSATIONS.length} conversations.`,
  );
  console.log(`\nDemo accounts (password for all: ${DEMO_PASSWORD})`);
  console.log("Mentors:");
  for (const mentor of DEMO_MENTORS) {
    console.log(`  ${mentor.email}  ${mentor.firstName} ${mentor.lastName}, ${mentor.jobTitle} @ ${mentor.company}`);
  }
  console.log("Mentees:");
  for (const mentee of DEMO_MENTEES) {
    console.log(`  ${mentee.email}  ${mentee.firstName} ${mentee.lastName}, ${mentee.currentRole}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
