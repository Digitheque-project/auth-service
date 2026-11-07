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

import { RoleService } from './role.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiBearerAuth('access-token')
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // CREATE
  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Créer un rôle',
  })
  @ApiBody({
    type: CreateRoleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Rôle créé avec succès',
  })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  // FIND ALL
  @Get()
  @ApiOperation({
    summary: 'Lister les rôles',
  })
  findAll() {
    return this.roleService.findAll();
  }

  // FIND ONE
  @Get(':id')
  @ApiOperation({
    summary: 'Afficher un rôle',
  })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Modifier un rôle',
  })
  @ApiBody({
    type: UpdateRoleDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Supprimer un rôle',
  })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
