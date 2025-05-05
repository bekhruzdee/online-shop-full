import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "@nestjs/class-validator";

  
  export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string;
  
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
  }
  