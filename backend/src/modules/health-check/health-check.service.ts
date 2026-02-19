import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  public async healthCheck() {
    return {
      code: 200,
      message: 'Server is running',
    };
  }
}
