import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserClientService } from './user-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('USER_SERVICE_URL') ?? 'http://localhost:3001',
        timeout: 5000,
        headers: {
          'x-api-key': configService.get<string>('INTERNAL_API_KEY') ?? '',
        },
      }),
    }),
  ],
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}
