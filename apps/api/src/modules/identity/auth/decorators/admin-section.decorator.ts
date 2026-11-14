import { SetMetadata } from '@nestjs/common';
import type { AdminSection } from '../admin-access';

export const ADMIN_SECTION_KEY = 'adminSection';

/**
 * The admin area a controller belongs to. AdminGuard lets an admin read it
 * (GET) or change it (anything else) only when their admin type allows.
 */
export const AdminSectionAccess = (section: AdminSection) =>
  SetMetadata(ADMIN_SECTION_KEY, section);
