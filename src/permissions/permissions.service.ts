import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find();
  }

  async findByNames(names: string[]): Promise<PermissionEntity[]> {
    return this.permissionRepository
      .createQueryBuilder('p')
      .where('p.name IN (:...names)', { names })
      .getMany();
  }
}
