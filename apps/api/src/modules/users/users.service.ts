import { Injectable } from '@nestjs/common';
import { UserRole } from '@median/shared';

@Injectable()
export class UsersService {
  roles() {
    return Object.values(UserRole);
  }
}
