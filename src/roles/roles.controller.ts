import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRolesToUserDto } from './dto/assign-roles.dto';
import { AssignPermissionsDto } from 'src/permissions/dto/assign-permissions.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleName } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Controller('roles')
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ─── Role CRUD ─────────────────────────────────────────────────────────────

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles(RoleName.SUPER_ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  // ─── Assign permissions to role ────────────────────────────────────────────

  @Post('assign-permissions')
  @Roles(RoleName.SUPER_ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  assignPermissions(@Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(dto);
  }

  // ─── Assign roles to user ──────────────────────────────────────────────────

  @Post('assign-user')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  assignRolesToUser(@Body() dto: AssignRolesToUserDto) {
    return this.rolesService.assignRolesToUser(dto);
  }

  @Get('user/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.ROLES_MANAGE)
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getUserRoles(id);
  }
}
