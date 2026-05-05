import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  roles() {
    return Object.values(UserRole);
  }
}
