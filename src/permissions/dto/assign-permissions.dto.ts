import { IsArray, IsEnum, IsNotEmpty, IsNumber } from '@nestjs/class-validator';
import { Permission } from 'src/common/enums/permission.enum';

export class AssignPermissionsDto {
  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}
