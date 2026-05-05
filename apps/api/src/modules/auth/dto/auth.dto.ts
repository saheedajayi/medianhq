import type { UserRole } from '@prisma/client';

export type RegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type LoginDto = {
  email: string;
  password: string;
};
