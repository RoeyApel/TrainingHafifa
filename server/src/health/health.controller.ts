import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { HealthStatus } from '../types/health/types.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthStatus {
    return { status: 'ok' };
  }
}
