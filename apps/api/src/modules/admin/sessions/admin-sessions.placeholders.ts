/**
 * PLACEHOLDER DATA. Sessions are not recorded and consent is not collected yet,
 * so nothing here is real: it stands in for the Recording tab until recording
 * exists. Replace with a real source and delete this file.
 */

const CONSENT = ['BOTH', 'MENTEE', 'BOTH', 'MENTOR', 'BOTH', 'BOTH'] as const;
const TYPES = [
  'Portfolio Review',
  'Career Guidance',
  'Portfolio Review',
  'Portfolio Review',
  'Data Analysis',
  'Portfolio Review',
];

const person = (id: string, name: string, role: string, country: string) => ({
  id,
  name,
  avatarUrl: null,
  role,
  country,
});

export const placeholderRecordings = () => ({
  stats: {
    total: 100,
    totalChangePct: 12,
    dualConsent: 95,
    pendingDeletion: 6,
  },
  total: 100,
  items: CONSENT.map((consent, index) => ({
    id: `placeholder-recording-${index + 1}`,
    sessionId: 'S-7F3KD6',
    type: TYPES[index],
    startsAt: new Date('2025-10-06T08:25:00.000Z'),
    durationMinutes: 30,
    mentor: person(
      'placeholder-mentor',
      'Kwame Mensah',
      'Product Designer',
      'Nigeria',
    ),
    mentee: person('placeholder-mentee', 'Aisha Bello', 'Student', 'Ghana'),
    consent,
    recording: {
      format: 'MP4',
      sizeMb: 342,
      recordedAt: new Date('2025-10-06T09:45:00.000Z'),
    },
  })),
});
