import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ServiceService } from './service.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiBearerAuth('access-token')
@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // CREATE
  @Post()
  @ApiOperation({
    summary: 'Créer un service',
  })
  @ApiBody({
    type: CreateServiceDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Service créé avec succès',
  })
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  // FIND ALL
  @Get()
  @ApiOperation({
    summary: 'Lister les services',
  })
  findAll() {
    return this.serviceService.findAll();
  }

  // FIND ONE
  @Get(':id')
  @ApiOperation({
    summary: 'Afficher un service',
  })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un service',
  })
  @ApiBody({
    type: UpdateServiceDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un service',
  })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
