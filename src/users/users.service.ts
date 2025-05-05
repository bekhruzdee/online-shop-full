import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<{ success: boolean; message: string; data?: User }> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const newAdmin = this.usersRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    const savedAdmin = await this.usersRepository.save(newAdmin);

    return {
      success: true,
      message: 'Admin created successfully✅',
      data: savedAdmin,
    };
  }

  async getAllAdmins(): Promise<{
    success: boolean;
    message: string;
    data: User[];
  }> {
    const admins = await this.usersRepository.find({
      where: { role: 'admin' },
    });

    if (!admins.length) {
      return {
        success: false,
        message: 'No admins found❌',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Admins retrieved successfully✅',
      data: admins,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    data: Omit<User, 'password'>[];
  }> {
    const users = await this.usersRepository.find({
      select: ['id', 'username', 'email', 'role', 'created_at', 'updated_at'],
    });
    return {
      success: true,
      message: 'Users data retrieved successfully',
      data: users,
    };
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'role', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; message: string; data?: User }> {
    const existingUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        message: 'User not found❌',
      };
    }

    await this.usersRepository.update(userId, updateUserDto);
    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser || undefined,
    };
  }

  async remove(userId: number): Promise<{ success: boolean; message: string }> {
    const existingUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    await this.usersRepository.delete(userId);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
