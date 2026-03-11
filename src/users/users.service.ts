import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';
import { RoleName } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getAllAdmins(): Promise<{
    success: boolean;
    message: string;
    data: User[];
  }> {
    const admins = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.name = :roleName', { roleName: RoleName.ADMIN })
      .getMany();

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
      relations: ['roles', 'roles.permissions'],
    });
    const data = users.map(({ password, ...rest }) => rest);
    return {
      success: true,
      message: 'Users data retrieved successfully',
      data: data as Omit<User, 'password'>[],
    };
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...rest } = user;
    return rest as Omit<User, 'password'>;
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
