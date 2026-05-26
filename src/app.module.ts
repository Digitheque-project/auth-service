import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { ServiceModule } from './service/service.module';
import { UserServiceRoleModule } from './user-service-role/user-service-role.module';
import { AuthModule } from './auth/auth.module';
import { Permission } from './permission/entities/permission.entity';
import { Role } from './role/entities/role.entity';
import { Service } from './service/entities/service.entity';
import { UserServiceRole } from './user-service-role/entities/user-service-role.entity';
import { User } from './user/entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [User, Role, Permission, Service, UserServiceRole],
        synchronize: true,
      }),
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    ServiceModule,
    UserServiceRoleModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
