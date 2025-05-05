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
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(`create-admin`)
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('admins')
  async getAllAdmins() {
    return this.usersService.getAllAdmins();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get(`all`)
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('id/:id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update/:id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('delete/:id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
}
