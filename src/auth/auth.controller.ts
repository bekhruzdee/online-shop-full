import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  SetMetadata,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './role.guard';
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
    res.clearCookie('token');
    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  @Get('admin-data')
  getAdminData(@Req() req) {
    return this.authService.getAllMyData(req['payload']);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @SetMetadata('roles', ['client'])
  @Get('client-data')
  getClientData(@Req() req) {
    return this.authService.getAllMyData(req['payload']);
  }
}
