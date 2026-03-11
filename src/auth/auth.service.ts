// src/auth/auth.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { RoleName } from 'src/common/enums/role.enum';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createAuthDto.username },
        { email: createAuthDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or Email already exists.');
    }

    // Assign default 'client' role on registration
    const clientRole = await this.roleRepository.findOne({
      where: { name: RoleName.CLIENT },
    });

    const user = this.userRepository.create();
    user.username = createAuthDto.username;
    user.password = await bcrypt.hash(createAuthDto.password, 10);
    user.email = createAuthDto.email;
    user.roles = clientRole ? [clientRole] : [];

    await this.userRepository.save(user);
    return 'You are registered✅';
  }

  async login(loginDto: { username: string; password: string }, res: Response) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User Not Found ⚠️');
    }
    const checkPass = await bcrypt.compare(loginDto.password, user.password);
    if (!checkPass) {
      throw new NotFoundException('Password Error ⚠️');
    }

    const roleNames = user.roles.map((r) => r.name);
    const permissions = [
      ...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name))),
    ];

    const payload = {
      id: user.id,
      username: user.username,
      roles: roleNames,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { id: user.id, username: user.username },
      { expiresIn: '7d' },
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...userData } = user;
    return res.json({ userData, access_token: accessToken });
  }

  logout(): { message: string } {
    return { message: 'Logout successfully✅' };
  }

  async getAllMyData(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }
}
