import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto) {
    try {
      const existing = await this.permissionRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Cette permission existe déjà');
      }

      const permission = this.permissionRepo.create({
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      });

      await this.permissionRepo.save(permission);

      return {
        message: 'Permission créée avec succès',
        permission,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la création de la permission");
    }
  }

  async findAll() {
    return this.permissionRepo.find();
  }

  async findOne(id: string) {
    const permission = await this.permissionRepo.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission introuvable');
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    try {
      const permission = await this.findOne(id);

      if (dto.name) {
        const existing = await this.permissionRepo.findOne({
          where: { name: dto.name },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException('Cette permission existe déjà');
        }
      }

      Object.assign(permission, dto);

      await this.permissionRepo.save(permission);

      return {
        message: 'Permission mise à jour',
        permission,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la mise à jour de la permission");
    }
  }

  async remove(id: string) {
    try {
      const permission = await this.findOne(id);

      await this.permissionRepo.remove(permission);

      return {
        message: 'Permission supprimée',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Erreur lors de la suppression de la permission");
    }
  }
}
