/** "Lagos, Nigeria" is stored as one string; the country is the last part */
export const countryOf = (location?: string | null) =>
  location?.split(',').pop()?.trim() || null;
