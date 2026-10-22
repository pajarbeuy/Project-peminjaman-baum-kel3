import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Guard RBAC: memastikan user yang sudah terautentikasi memiliki role yang sesuai.
 * Harus digunakan bersama JwtAuthGuard.
 * Sesuai security.md: kontrol akses dilakukan di backend, bukan hanya di UI.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk melakukan tindakan ini.',
      );
    }

    return true;
  }
}
