import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { Permission } from './permission/entities/permission.entity';
import { Role } from './role/entities/role.entity';
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
        entities: [Role, Permission],

        // === FIX SSL (important) ===
        ssl: configService.get('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,

        synchronize: process.env.NODE_ENV !== 'production', // false en production
        migrationsRun: true,
      }),
    }),
    RoleModule,
    PermissionModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
