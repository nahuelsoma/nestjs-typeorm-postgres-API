import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PayloadToken } from './../models/token.model';
import { UsersService } from './../../users/services/users.service';
import { User } from './../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (user && isMatch) {
      return user;
    }
    return null;
  }

  generateJWT(user: User) {
    const payload: PayloadToken = {
      role: user.role,
      sub: user.id,
    };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
