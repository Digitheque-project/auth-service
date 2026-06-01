import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UserClientService {
  constructor(private readonly httpService: HttpService) {}

  private async request<T>(call: () => Promise<{ data: T }>): Promise<T> {
    try {
      const result = await call();
      return result.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      console.log('================');
      console.log('CODE:', axiosError.code);
      console.log('MESSAGE:', axiosError.message);
      console.log('STATUS:', axiosError.response?.status);
      console.log('DATA:', axiosError.response?.data);
      console.log('URL:', axiosError.config?.url);
      console.log('BASE URL:', axiosError.config?.baseURL);
      console.log(
        'FULL URL:',
        `${axiosError.config?.baseURL}${axiosError.config?.url}`,
      );
      console.log('================');

      if (
        axiosError.code === 'ECONNREFUSED' ||
        axiosError.code === 'ECONNRESET'
      ) {
        throw new InternalServerErrorException(
          'Service utilisateur indisponible',
        );
      }

      if (axiosError.response) {
        throw {
          response: {
            status: axiosError.response.status,
            data: axiosError.response.data,
          },
        };
      }

      throw new InternalServerErrorException(
        'Erreur de communication avec le service utilisateur',
      );
    }
  }

  async create(data: Record<string, any>) {
    return this.request(() =>
      firstValueFrom(
        this.httpService.post('/users', data).pipe(
          timeout(10000),
          catchError((err) => throwError(() => err)),
        ),
      ),
    );
  }

  async findByEmail(email: string) {
    return this.request(() =>
      firstValueFrom(
        this.httpService
          .get(`/users/by-email/${encodeURIComponent(email)}`)
          .pipe(
            timeout(10000),
            catchError((err) => throwError(() => err)),
          ),
      ),
    );
  }

  async findOne(id: string) {
    return this.request(() =>
      firstValueFrom(
        this.httpService.get(`/users/${id}`).pipe(
          timeout(10000),
          catchError((err) => throwError(() => err)),
        ),
      ),
    );
  }
}
