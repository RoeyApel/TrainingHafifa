import { Module } from '@nestjs/common';
import { GeoServerModule } from '../geoserver/geoserver.module.js';
import { TrainingAreasService } from './training-areas.service.js';

@Module({
  imports: [GeoServerModule],
  providers: [TrainingAreasService],
  exports: [TrainingAreasService],
})
export class TrainingAreasModule {}
