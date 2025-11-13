import { SetMetadata } from '@nestjs/common';


/**
 * Apply this decorator to protect a route with specific roles.
 * Example:
 * @Roles(AdminRole.SUPER_ADMIN)
 */
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT',
  AUDITOR = 'AUDITOR',
}
export const ROLES_KEY = 'roles';
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);