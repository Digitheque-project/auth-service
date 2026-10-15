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
        // Passe par la gateway (registre central des URLs de services) au lieu
        // d'appeler user-services en direct : en cas de coupure/migration du
        // service, seule la variable d'env de la gateway change, pas celle-ci.
        baseURL: configService.get<string>('GATEWAY_URL') ?? 'http://localhost:8080',
        timeout: 15000,
      }),
    }),
  ],
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}
