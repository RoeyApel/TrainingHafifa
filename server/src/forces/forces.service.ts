import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ForceDeployment } from '../entities/force-deployment.entity.js';
import { GeoServerWfsService } from '../geoserver/geoserver-wfs.service.js';

/**
 * Business logic for force polygons.
 *
 * Writes go through GeoServer WFS-T (GeoServerWfsService). The repository is
 * for reads and spatial queries against PostGIS.
 *
 * TODO: before saving a new or edited force, check it against the training
 * areas (layer 1):
 * - intersects an area with status "maintenance" -> block, don't save,
 *   return an error ("השטח המבוקש סגור לתחזוקה", red)
 * - intersects an area with training type "live_fire" -> save, but return a
 *   warning ("התראת בטיחות חמורה", orange)
 * - otherwise -> save and return success ("האימון נקבע בהצלחה", green)
 *
 * TODO: decide where the training areas are queried from. They currently
 * live only in the GeoPackage published by GeoServer, not in PostGIS.
 */
@Injectable()
export class ForcesService {
  constructor(
    @InjectRepository(ForceDeployment)
    private readonly forcesRepository: Repository<ForceDeployment>,
    private readonly geoServerWfs: GeoServerWfsService,
  ) {}
}
