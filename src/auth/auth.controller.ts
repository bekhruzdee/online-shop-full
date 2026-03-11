import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleName } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Res() res: Response,
  ) {
    return await this.authService.login(loginDto, res);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Res() res: Response) {
    const result = this.authService.logout();
    res.clearCookie('refresh_token');
    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.USERS_READ)
  @Get('admin-data')
  getAdminData(@Req() req) {
    return this.authService.getAllMyData(req['user']);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMyData(@Req() req) {
    return this.authService.getAllMyData(req['user']);
  }
}
