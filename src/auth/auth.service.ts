import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  // REGISTER
  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      name: dto.name,
      firstname: dto.firstname,
      job: dto.job,
      matricule: dto.matricule,
      registration_number_professional_order:
        dto.registration_number_professional_order,
      professional_order: dto.professional_order,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      isActive: dto.isActive ?? true,
    });

    await this.userRepo.save(user);

    return {
      message: 'Utilisateur créé avec succès',
      user,
    };
  }

  // LOGIN
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },

      relations: {
        serviceRoles: {
          service: true,

          role: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifients incorect');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Identifients incorect');
    }

    const services = user.serviceRoles.map((sr) => ({
      name: sr.service.name,
      role: sr.role.name,
      permissions: sr.role.permissions.map((p) => p.name),
    }));

    const payload = {
      userId: user.id,
      name: user.name,
      firsname: user.firstname,
      services,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
