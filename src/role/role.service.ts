import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto) {
    try {
      const existing = await this.roleRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Ce rôle existe déjà');
      }

      const permissions = await this.permissionRepo.find({
        where: { id: In(dto.permissionIds) },
      });

      const role = this.roleRepo.create({
        name: dto.name,
        description: dto.description,
        permissions,
        isActive: dto.isActive ?? true,
      });

      await this.roleRepo.save(role);

      return {
        message: 'Rôle créé avec succès',
        role,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la création du rôle");
    }
  }

  async findAll() {
    return this.roleRepo.find();
  }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    try {
      const role = await this.findOne(id);

      if (dto.name) {
        const existing = await this.roleRepo.findOne({
          where: { name: dto.name },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException('Ce rôle existe déjà');
        }
      }

      let permissions = role.permissions;

      if (dto.permissionIds) {
        permissions = await this.permissionRepo.find({
          where: { id: In(dto.permissionIds) },
        });
      }

      Object.assign(role, {
        name: dto.name ?? role.name,
        description: dto.description ?? role.description,
        permissions,
        isActive: dto.isActive ?? role.isActive,
      });

      await this.roleRepo.save(role);

      return {
        message: 'Rôle mis à jour',
        role,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la mise à jour du rôle");
    }
  }

  async remove(id: string) {
    try {
      const role = await this.findOne(id);

      await this.roleRepo.remove(role);

      return {
        message: 'Rôle supprimé',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la suppression du rôle");
    }
  }
}
