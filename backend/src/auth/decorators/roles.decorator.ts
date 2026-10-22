import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator untuk membatasi akses endpoint ke role tertentu.
 * Harus digunakan bersama RolesGuard.
 *
 * @example
 * @Roles(Role.TU, Role.BAUM_STAFF)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
