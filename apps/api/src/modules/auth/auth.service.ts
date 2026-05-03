import { Injectable } from '@nestjs/common';
import type { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  register(dto: RegisterDto) {
    return {
      status: 'PENDING_IMPLEMENTATION',
      user: {
        email: dto.email,
        role: dto.role,
      },
    };
  }

  login(dto: LoginDto) {
    return {
      status: 'PENDING_IMPLEMENTATION',
      email: dto.email,
    };
  }
}
