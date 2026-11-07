import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PermissionService } from './permission.service';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiBearerAuth('access-token')
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // CREATE
  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Créer une permission',
  })
  @ApiBody({
    type: CreatePermissionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Permission créée avec succès',
  })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  // FIND ALL
  @Get()
  @ApiOperation({
    summary: 'Lister les permissions',
  })
  findAll() {
    return this.permissionService.findAll();
  }

  // FIND ONE
  @Get(':id')
  @ApiOperation({
    summary: 'Afficher une permission',
  })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Modifier une permission',
  })
  @ApiBody({
    type: UpdatePermissionDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Supprimer une permission',
  })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
