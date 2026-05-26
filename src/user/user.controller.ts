import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // FIND ALL
  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs',
  })
  findAll() {
    return this.userService.findAll();
  }

  // FIND ONE
  @Get(':id')
  @ApiOperation({
    summary: 'Afficher un utilisateur',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un utilisateur',
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
