import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from '@nestjs/class-validator';

export class AssignRolesToUserDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsArray()
  @IsString({ each: true })
  roleNames: string[];
}
