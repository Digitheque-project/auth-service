import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'rakoto@gmail.com', description: 'Adresse email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Mot de passe' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
