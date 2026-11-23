import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForceDeployment } from '../entities/force-deployment.entity.js';
import { GeoServerModule } from '../geoserver/geoserver.module.js';
import { TrainingAreasModule } from '../training-areas/training-areas.module.js';
import { ForcesController } from './forces.controller.js';
import { ForcesService } from './forces.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForceDeployment]),
    GeoServerModule,
    TrainingAreasModule,
  ],
  controllers: [ForcesController],
  providers: [ForcesService],
})
export class ForcesModule {}
