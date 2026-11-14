/**
 * PLACEHOLDER DATA. Nothing flags content yet and there is no table for flags,
 * so everything here is made up and reset when the API restarts. Replace the
 * repository's in-memory lists with real queries and delete this file.
 */
import type {
  ContentFlag,
  FlagContentType,
  FlagPerson,
  FlagStatus,
  ModerationHistoryEntry,
} from './dto/admin-moderation.dto';

const MINUTE_MS = 60 * 1000;

const person = (
  id: string,
  name: string,
  role: FlagPerson['role'],
): FlagPerson => ({
  id,
  name,
  avatarUrl: null,
  role,
  joinedAt: new Date('2022-04-12T09:00:00.000Z'),
  country: 'Nigeria',
  accountStatus: 'Active',
});

const KWAME = person('placeholder-kwame', 'Kwame Mensah', 'Mentor');
const AISHA = person('placeholder-aisha', 'Aisha Bello', 'Mentee');

const SAMPLES: Record<
  FlagContentType,
  { content: string; reason: string; statuses: FlagStatus[] }[]
> = {
  FORUM_POST: [
    {
      content:
        "This platform is a waste of time.... It doesn't worth your money at all",
      reason: 'Hate Speech/ Negative Attitude',
      statuses: ['PENDING'],
    },
    {
      content: 'Check our my new business (www.jdjbuidbu jndid.xyz)',
      reason: 'Spam/Self Promotion',
      statuses: ['PENDING'],
    },
  ],
  MESSAGE: [
    {
      content:
        "Thanks for the session. I really appreciate it. Can we talk on whatsapp ? It's more convenient fo me. 09038744625.",
      reason: 'Personal contact request',
      statuses: ['FLAGGED', 'PENDING', 'REVIEWED'],
    },
  ],
  PROFILE_TEXT: [
    {
      content: "I'm a professional money maker.... DM me for quick cash",
      reason: 'Suspicious and potential scam',
      statuses: ['FLAGGED'],
    },
    {
      content:
        "I love to help people, I'm also a spiritual healer. contact me for more",
      reason: 'Suspicious and potential scam',
      statuses: ['FLAGGED', 'REVIEWED', 'ESCALATED'],
    },
  ],
};

const COUNTS: Record<FlagContentType, number> = {
  FORUM_POST: 30,
  MESSAGE: 10,
  PROFILE_TEXT: 10,
};

export function placeholderFlags(now: Date): ContentFlag[] {
  const flags: ContentFlag[] = [];

  for (const contentType of Object.keys(COUNTS) as FlagContentType[]) {
    for (let index = 0; index < COUNTS[contentType]; index++) {
      const samples = SAMPLES[contentType];
      const sample = samples[index % samples.length];
      // Spread over the last few days, the newest flagged a little over two hours ago
      const flaggedAt = new Date(
        now.getTime() - (135 + flags.length * 95) * MINUTE_MS,
      );
      const isMessage = contentType === 'MESSAGE';

      flags.push({
        id: `placeholder-flag-${flags.length + 1}`,
        contentType,
        content: sample.content,
        author: isMessage || index % 2 ? AISHA : KWAME,
        recipient: isMessage ? KWAME : null,
        profileField: contentType === 'PROFILE_TEXT' ? 'Bio' : null,
        reason: sample.reason,
        flaggedBy: 'Automated System',
        flaggedAt,
        status: sample.statuses[index % sample.statuses.length],
        auditTrail: [
          { at: flaggedAt, label: 'Flagged by System', detail: sample.reason },
        ],
      });
    }
  }

  // Newest first, as the queue shows them
  return flags.sort((a, b) => b.flaggedAt.getTime() - a.flaggedAt.getTime());
}

export function placeholderHistory(now: Date): ModerationHistoryEntry[] {
  const types: FlagContentType[] = ['FORUM_POST', 'MESSAGE', 'PROFILE_TEXT'];

  return Array.from({ length: 9 }, (_, index) => {
    const contentType = types[index % types.length];
    return {
      id: `placeholder-history-${index + 1}`,
      at: new Date(now.getTime() - (index + 1) * 24 * 60 * MINUTE_MS),
      contentType,
      content:
        contentType === 'MESSAGE'
          ? "Can you send me your Whatsapp number, I'd like to tell you something"
          : SAMPLES.FORUM_POST[0].content,
      authorName: 'Ibrahim Lawal',
      outcome: 'FLAGGED',
      reviewer: { name: 'Kwame Mensah', role: 'Admin', avatarUrl: null },
      reason: 'Hate Speech/ Negative Attitude',
    };
  });
}
