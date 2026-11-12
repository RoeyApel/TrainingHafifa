import { Module } from '@nestjs/common';
import { GeoServerWfsService } from './geoserver-wfs.service.js';

@Module({
  providers: [GeoServerWfsService],
  exports: [GeoServerWfsService],
})
export class GeoServerModule {}
