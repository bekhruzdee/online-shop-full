import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const user = context.switchToHttp().getRequest()['user'];
    if (!user?.roles) {
      throw new ForbiddenException('Access denied: no roles assigned');
    }

    const hasRole = requiredRoles.some((role) =>
      (user.roles as string[]).includes(role),
    );
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires role(s) [${requiredRoles.join(', ')}]`,
      );
    }
    return true;
  }
}
