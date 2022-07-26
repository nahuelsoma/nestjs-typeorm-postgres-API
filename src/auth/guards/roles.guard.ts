import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable } from 'rxjs';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../models/roles.model';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler()); // ['admin', 'customer', 'super-admin']
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as PayloadToken; // { role: admin, sub: ansf913fb1fn1ma0dsgbasb1032b }

    const isAuth = roles.some((role) => role === user.role); // If isAuth is true, the user is allowed to use this endpoint
    if (!isAuth) {
      throw new UnauthorizedException(
        `Unautorized: ${user.role} can not perform this action`,
      );
    }
    return isAuth;
  }
}
