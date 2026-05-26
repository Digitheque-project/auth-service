import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserServiceRole } from './entities/user-service-role.entity';

import { User } from '../user/entities/user.entity';
import { Service } from '../service/entities/service.entity';
import { Role } from '../role/entities/role.entity';

import { CreateUserServiceRoleDto } from './dto/create-user-service-role.dto';
import { UpdateUserServiceRoleDto } from './dto/update-user-service-role.dto';

@Injectable()
export class UserServiceRoleService {
  constructor(
    @InjectRepository(UserServiceRole)
    private readonly usrRepo: Repository<UserServiceRole>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  // CREATE
  async create(dto: CreateUserServiceRoleDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    const role = await this.roleRepo.findOne({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    const usr = this.usrRepo.create({
      user,
      service,
      role,
    });

    await this.usrRepo.save(usr);

    return {
      message: 'Association utilisateur-service-rôle créée',
      data: usr,
    };
  }

  // FIND ALL
  async findAll() {
    return this.usrRepo.find({
      relations: {
        user: true,
      },
    });
  }

  // FIND ONE
  async findOne(id: string) {
    const usr = await this.usrRepo.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    if (!usr) {
      throw new NotFoundException('Association introuvable');
    }

    return usr;
  }

  // UPDATE
  async update(id: string, dto: UpdateUserServiceRoleDto) {
    const usr = await this.findOne(id);

    if (dto.userId) {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      usr.user = user;
    }

    if (dto.serviceId) {
      const service = await this.serviceRepo.findOne({
        where: { id: dto.serviceId },
      });

      if (!service) {
        throw new NotFoundException('Service introuvable');
      }

      usr.service = service;
    }

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Rôle introuvable');
      }

      usr.role = role;
    }

    await this.usrRepo.save(usr);

    return {
      message: 'Association mise à jour',
      data: usr,
    };
  }

  // DELETE
  async remove(id: string) {
    const usr = await this.findOne(id);

    await this.usrRepo.remove(usr);

    return {
      message: 'Association supprimée',
    };
  }
}
