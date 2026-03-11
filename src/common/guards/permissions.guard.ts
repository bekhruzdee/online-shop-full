import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) return true;

    const user = context.switchToHttp().getRequest()['user'];
    if (!user?.permissions) {
      throw new ForbiddenException('Access denied: no permissions assigned');
    }

    const userPermissions = user.permissions as string[];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied: requires permission(s) [${requiredPermissions.join(', ')}]`,
      );
    }
    return true;
  }
}
