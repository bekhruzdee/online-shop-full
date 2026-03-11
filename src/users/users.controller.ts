import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleName } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admins')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.USERS_READ)
  async getAllAdmins() {
    return this.usersService.getAllAdmins();
  }

  @Get('all')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.USERS_READ)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('id/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MODERATOR)
  @Permissions(Permission.USERS_READ)
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch('update/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.USERS_UPDATE)
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('delete/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.USERS_DELETE)
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
}
