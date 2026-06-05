import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserClientService } from '../user-client/user-client.service';
import { RoleService } from '../role/role.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  // Cache in-memory pour les services (id → { name, baseUrl }) — TTL 5 min
  private static serviceCache: Map<string, { name: string; baseUrl: string }> | null = null;
  private static cacheTimestamp = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000;
  private static cachePromise: Promise<void> | null = null;

  constructor(
    private readonly userClient: UserClientService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
  ) {}

  private async fetchServicesWithCache(): Promise<any[]> {
    const now = Date.now();
    if (AuthService.serviceCache && (now - AuthService.cacheTimestamp) < AuthService.CACHE_TTL) {
      return Array.from(AuthService.serviceCache.entries()).map(([id, svc]) => ({ id, ...svc }));
    }

    // Évite les appels concurrents pendant le premier chargement
    if (AuthService.cachePromise) {
      await AuthService.cachePromise;
      const cache = AuthService.serviceCache;
      if (cache) {
        return Array.from(cache.entries()).map(([id, svc]) => ({ id, ...svc }));
      }
    }

    AuthService.cachePromise = (async () => {
      try {
        const url = this.configService.get<string>('SERVICE_SERVICE_URL');
        const apiKey = this.configService.get<string>('INTERNAL_API_KEY');
        const res = await fetch(`${url}/services`, {
          signal: AbortSignal.timeout(5000),
          headers: { 'x-api-key': apiKey ?? '' },
        });
        const data = await res.json();
        const list: any[] = Array.isArray(data) ? data : (data.services ?? []);
        AuthService.serviceCache = new Map(list.map(s => [s.id, { name: s.name, baseUrl: s.baseUrl }]));
        AuthService.cacheTimestamp = Date.now();
        console.log('Service cache refreshed:', AuthService.serviceCache.size, 'services');
      } catch {
        console.warn('Failed to fetch services, cache remains empty');
      } finally {
        AuthService.cachePromise = null;
      }
    })();

    await AuthService.cachePromise;
    const result = AuthService.serviceCache ?? new Map();
    return Array.from(result.entries()).map(([id, svc]) => ({ id, ...svc }));
  }

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
        data?.message || 'Erreur lors de la création de l\'utilisateur',
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

      const rawServices = (userData.serviceRoles ?? []).map((sr: any) => ({
        serviceId: sr.serviceId,
        roleId: sr.roleId,
      }));

      // Enrich with service names (cached) and role names (local DB)
      const [allRoles, servicesFromCache] = await Promise.all([
        this.roleService.findAll(),
        this.fetchServicesWithCache(),
      ]);

      const roleMap = new Map<string, string>();
      for (const r of allRoles) roleMap.set(r.id, r.name);

      const serviceMap = new Map<string, any>();
      for (const s of servicesFromCache) serviceMap.set(s.id, s);

      const services = rawServices.map(s => {
        const cached = serviceMap.get(s.serviceId);
        return {
          serviceId: s.serviceId,
          serviceName: cached?.name ?? null,
          baseUrl: cached?.baseUrl ?? null,
          roleId: s.roleId,
          roleName: roleMap.get(s.roleId) ?? null,
        };
      });

      const payload = {
        userId: userData.id,
        name: userData.name,
        firstname: userData.firstname,
        email: userData.email,
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
