import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserClientService } from '../user-client/user-client.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userClient: UserClientService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.userClient.create({
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

      return {
        message: 'Utilisateur créé avec succès',
        user,
      };
    } catch (error) {
      console.error(error);

      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        throw new ConflictException(
          data?.message || 'Utilisateur déjà existant',
        );
      }

      if (status === 400) {
        throw new BadRequestException(data?.message || 'Données invalides');
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        throw new InternalServerErrorException(
          'Service utilisateur indisponible',
        );
      }

      throw new InternalServerErrorException(
        data?.message || 'Erreur lors de la création de l’utilisateur',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const userData = await this.userClient.findByEmail(dto.email);

      if (!userData) {
        throw new UnauthorizedException('Identifiants incorrects');
      }

      const valid = await bcrypt.compare(dto.password, userData.password);

      if (!valid) {
        throw new UnauthorizedException('Identifiants incorrects');
      }

      const services = (userData.serviceRoles ?? []).map((sr: any) => ({
        serviceId: sr.serviceId,
        roleId: sr.roleId,
      }));

      const payload = {
        userId: userData.id,
        name: userData.name,
        firstname: userData.firstname,
        services,
      };

      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      if (
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error(error);

      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        throw new InternalServerErrorException(
          'Service utilisateur indisponible',
        );
      }

      throw new InternalServerErrorException(
        'Erreur lors de la connexion',
      );
    }
  }
}
