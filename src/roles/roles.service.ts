import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRolesToUserDto } from './dto/assign-roles.dto';
import { AssignPermissionsDto } from 'src/permissions/dto/assign-permissions.dto';
import { Permission } from 'src/common/enums/permission.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── Roles ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    if (exists)
      throw new ConflictException(`Role '${dto.name}' already exists`);
    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
    });
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<{ message: string }> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
    return { message: `Role '${role.name}' deleted successfully` };
  }

  // ─── Assign permissions to role ────────────────────────────────────────────

  async assignPermissions(
    dto: AssignPermissionsDto,
  ): Promise<{ message: string; role: Role }> {
    const role = await this.findOne(dto.roleId);

    const permissions = await this.permissionRepository.findBy({
      name: In(dto.permissions),
    });

    if (permissions.length !== dto.permissions.length) {
      const found = permissions.map((p) => p.name as Permission);
      const missing = dto.permissions.filter((p) => !found.includes(p));
      throw new NotFoundException(
        `Permissions not found: ${missing.join(', ')}`,
      );
    }

    role.permissions = permissions;
    const updated = await this.roleRepository.save(role);
    return { message: 'Permissions assigned successfully', role: updated };
  }

  // ─── Assign roles to user ──────────────────────────────────────────────────

  async assignRolesToUser(
    dto: AssignRolesToUserDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User #${dto.userId} not found`);

    const roles = await this.roleRepository.findBy({ name: In(dto.roleNames) });
    if (roles.length !== dto.roleNames.length) {
      const found = roles.map((r) => r.name);
      const missing = dto.roleNames.filter((r) => !found.includes(r));
      throw new NotFoundException(`Roles not found: ${missing.join(', ')}`);
    }

    user.roles = roles;
    await this.userRepository.save(user);
    return {
      message: `Roles [${dto.roleNames.join(', ')}] assigned to user #${dto.userId}`,
    };
  }

  async getUserRoles(
    userId: number,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    const roles = user.roles.map((r) => r.name);
    const permissions = [
      ...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name))),
    ];
    return { roles, permissions };
  }
}
