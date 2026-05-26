import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from './entities/service.entity';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  // CREATE
  async create(dto: CreateServiceDto) {
    const service = this.serviceRepo.create({
      name: dto.name,
      baseUrl: dto.baseUrl,
      isActive: dto.isActive ?? true,
    });

    await this.serviceRepo.save(service);

    return {
      message: 'Service créé avec succès',
      service,
    };
  }

  // FIND ALL
  async findAll() {
    return this.serviceRepo.find();
  }

  // FIND ONE
  async findOne(id: string) {
    const service = await this.serviceRepo.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    return service;
  }

  // UPDATE
  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findOne(id);

    Object.assign(service, dto);

    await this.serviceRepo.save(service);

    return {
      message: 'Service mis à jour',
      service,
    };
  }

  // DELETE
  async remove(id: string) {
    const service = await this.findOne(id);

    await this.serviceRepo.remove(service);

    return {
      message: 'Service supprimé',
    };
  }
}
