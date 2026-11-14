/** Mentor Trust Score: reviews 40%, attendance 35%, response rate 25% */
export const TRUST_SCORE_WEIGHTS = {
  reviews: 40,
  attendance: 35,
  responseRate: 25,
} as const;

export type TrustScoreInput = {
  /** Sum and count of the 1 to 5 star ratings mentees gave */
  ratingSum: number;
  ratingCount: number;
  /** Sessions the mentor turned up to, and ones they missed */
  attended: number;
  missed: number;
  /** Booking requests answered in time, and ones left to expire */
  responded: number;
  expired: number;
};

export type TrustScore = {
  score: number;
  /** Before rounding, to one decimal place */
  weighted: number;
  label: 'Strong' | 'Good' | 'Fair' | 'Needs attention';
  components: {
    key: keyof typeof TRUST_SCORE_WEIGHTS;
    weight: number;
    /** 0 to 100, or null when there is nothing to measure yet */
    value: number | null;
  }[];
};

const ratio = (part: number, rest: number) =>
  part + rest > 0 ? (part / (part + rest)) * 100 : null;

const labelFor = (score: number): TrustScore['label'] => {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs attention';
};

/**
 * Null until the mentor has at least one review or booking. A part with nothing
 * to measure is left out and the remaining weights are scaled up to fill it.
 */
export function computeTrustScore(input: TrustScoreInput): TrustScore | null {
  const values = {
    reviews: input.ratingCount
      ? (input.ratingSum / input.ratingCount / 5) * 100
      : null,
    attendance: ratio(input.attended, input.missed),
    responseRate: ratio(input.responded, input.expired),
  };

  const keys = Object.keys(TRUST_SCORE_WEIGHTS) as (keyof typeof values)[];
  const measured = keys.filter((key) => values[key] !== null);
  if (measured.length === 0) return null;

  const totalWeight = measured.reduce(
    (sum, key) => sum + TRUST_SCORE_WEIGHTS[key],
    0,
  );
  const exact = measured.reduce(
    (sum, key) =>
      sum + ((values[key] as number) * TRUST_SCORE_WEIGHTS[key]) / totalWeight,
    0,
  );
  const weighted = Math.round(exact * 10) / 10;
  const score = Math.round(weighted);

  return {
    score,
    weighted,
    label: labelFor(score),
    components: keys.map((key) => ({
      key,
      weight: TRUST_SCORE_WEIGHTS[key],
      value: values[key] === null ? null : Math.round(values[key]),
    })),
  };
}
