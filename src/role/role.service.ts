import { Injectable, NotFoundException } from '@nestjs/common';

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

  // CREATE
  async create(dto: CreateRoleDto) {
    const permissions = await this.permissionRepo.find({
      where: {
        id: In(dto.permissionIds),
      },
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
  }

  // FIND ALL
  async findAll() {
    return this.roleRepo.find();
  }

  // FIND ONE
  async findOne(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    return role;
  }

  // UPDATE
  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    let permissions = role.permissions;

    if (dto.permissionIds) {
      permissions = await this.permissionRepo.find({
        where: {
          id: In(dto.permissionIds),
        },
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
  }

  // DELETE
  async remove(id: string) {
    const role = await this.findOne(id);

    await this.roleRepo.remove(role);

    return {
      message: 'Rôle supprimé',
    };
  }
}
