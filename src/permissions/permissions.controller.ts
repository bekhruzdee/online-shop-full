import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleName } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Controller('permissions')
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  findAll() {
    return this.permissionsService.findAll();
  }
}
