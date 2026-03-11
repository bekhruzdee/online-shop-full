import { IsEnum, IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';
import { RoleName } from 'src/common/enums/role.enum';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;

  @IsOptional()
  @IsString()
  description?: string;
}
