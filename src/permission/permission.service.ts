import { Injectable, NotFoundException } from '@nestjs/common';

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

  // CREATE
  async create(dto: CreatePermissionDto) {
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
  }

  // FIND ALL
  async findAll() {
    return this.permissionRepo.find();
  }

  // FIND ONE
  async findOne(id: string) {
    const permission = await this.permissionRepo.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission introuvable');
    }

    return permission;
  }

  // UPDATE
  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.findOne(id);

    Object.assign(permission, dto);

    await this.permissionRepo.save(permission);

    return {
      message: 'Permission mise à jour',
      permission,
    };
  }

  // DELETE
  async remove(id: string) {
    const permission = await this.findOne(id);

    await this.permissionRepo.remove(permission);

    return {
      message: 'Permission supprimée',
    };
  }
}
