import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserServiceRole } from './entities/user-service-role.entity';

import { User } from '../user/entities/user.entity';
import { Service } from '../service/entities/service.entity';
import { Role } from '../role/entities/role.entity';

import { UserServiceRoleService } from './user-service-role.service';
import { UserServiceRoleController } from './user-service-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserServiceRole, User, Service, Role])],

  controllers: [UserServiceRoleController],

  providers: [UserServiceRoleService],
})
export class UserServiceRoleModule {}
