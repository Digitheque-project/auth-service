import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // FIND ALL
  async findAll() {
    return this.userRepo.find({
      relations: {
        serviceRoles: {
          service: true,
          role: true,
        },
      },
    });
  }

  // FIND ONE
  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },

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
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  // UPDATE
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    Object.assign(user, dto);

    await this.userRepo.save(user);

    return {
      message: 'Utilisateur mis à jour avec succès',
      user,
    };
  }

  // DELETE
  async remove(id: string) {
    const user = await this.findOne(id);

    await this.userRepo.remove(user);

    return {
      message: 'Utilisateur supprimé avec succès',
    };
  }
}
