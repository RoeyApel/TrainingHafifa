import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export interface HealthStatus {
  status: 'ok';
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthStatus {
    return { status: 'ok' };
  }
}
