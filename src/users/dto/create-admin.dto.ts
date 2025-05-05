import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    IsIn,
  } from '@nestjs/class-validator';
  
  export class CreateAdminDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
  
    @IsNotEmpty()
    @IsString()
    @IsIn(['admin'])
    role: string;
  }
  