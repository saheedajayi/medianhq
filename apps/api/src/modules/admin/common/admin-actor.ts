import type { AuthUser } from '../../identity/auth/dto/auth.dto';

/**
 * The signed-in admin behind a request. Undefined when the backoffice key was
 * used, since that has no user account.
 */
export type AdminActor = Pick<AuthUser, 'id' | 'firstName' | 'lastName'>;

export const fullName = (person: { firstName: string; lastName: string }) =>
  `${person.firstName} ${person.lastName}`.trim();

/** Returns the value only when it is one of the allowed options */
export const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined => allowed.find((option) => option === value);
