import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Rakoto',
    description: "Nom de l'utilisateur",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Jean',
    description: "Prénom de l'utilisateur",
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({
    example: 'Médecin',
    description: 'Poste ou fonction',
  })
  @IsString()
  @IsNotEmpty()
  job: string;

  @ApiPropertyOptional({
    example: 'MAT001',
    description: 'Matricule interne',
  })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({
    example: 'ORD123456',
    description: "Numéro d'inscription à l'ordre professionnel",
  })
  @IsString()
  @IsNotEmpty()
  registration_number_professional_order: string;

  @ApiProperty({
    example: 'Ordre des médecins',
    description: "Nom de l'ordre professionnel",
  })
  @IsString()
  @IsNotEmpty()
  professional_order: string;

  @ApiProperty({
    example: 'rakoto@gmail.com',
    description: 'Adresse email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '0341234567',
    description: 'Numéro téléphone',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Mot de passe avec majuscule, minuscule, chiffre et caractère spécial',
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/[A-Z]/, {
    message: 'Le mot de passe doit contenir une majuscule',
  })
  @Matches(/[a-z]/, {
    message: 'Le mot de passe doit contenir une minuscule',
  })
  @Matches(/[0-9]/, {
    message: 'Le mot de passe doit contenir un chiffre',
  })
  @Matches(/[\W_]/, {
    message: 'Le mot de passe doit contenir un caractère spécial',
  })
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Utilisateur actif ou non',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
