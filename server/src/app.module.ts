import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createLoggerParams } from './common/logging/logger.config.js';
import { AppConfigModule } from './config/app-config.module.js';
import type { EnvironmentVariables } from './types/config/types.js';
import { DatabaseModule } from './database/database.module.js';
import { ForcesModule } from './forces/forces.module.js';
import { GeoServerModule } from './geoserver/geoserver.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        createLoggerParams(config.get('LOG_LEVEL', { infer: true })),
    }),
    DatabaseModule,
    HealthModule,
    GeoServerModule,
    ForcesModule,
  ],
})
export class AppModule {}
