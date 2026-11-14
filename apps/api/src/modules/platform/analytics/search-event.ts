import type { ExploreMentorsQueryDto } from '../../profiles/mentors/dto/explore-mentors-query.dto';
import { SEARCH_FILTER_NAMES } from './dto/analytics.dto';
import type { TrackedEvent } from './analytics-tracker.service';

const isSet = (value: string | number | undefined, unset: string[] = []) => {
  const text = value === undefined ? '' : String(value).trim().toLowerCase();
  return text !== '' && !unset.includes(text);
};

/**
 * The mentor search to log, or null when there's nothing to log: the plain
 * explore page with nothing typed or picked, or a later page of results
 * already counted.
 */
export function searchEventFor(
  query: ExploreMentorsQueryDto,
  resultCount: number,
): TrackedEvent | null {
  if (Number(query.page) > 1) return null;

  const filters = [
    isSet(query.category, ['all']) && SEARCH_FILTER_NAMES.category,
    isSet(query.priceType, ['all']) && SEARCH_FILTER_NAMES.priceType,
    isSet(query.minRating, ['0']) && SEARCH_FILTER_NAMES.minRating,
    isSet(query.location, ['all']) && SEARCH_FILTER_NAMES.location,
  ].filter((name) => name !== false);
  const search = query.search?.trim() || null;
  if (!search && filters.length === 0) return null;

  return { type: 'SEARCH', query: search, filters, resultCount };
}
