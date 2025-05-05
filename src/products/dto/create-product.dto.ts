import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator'

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsString()
  image?: string;
}