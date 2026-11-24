import { Injectable } from '@nestjs/common';
import type { Polygon } from 'typeorm';
import { polygonToEwkt } from '../common/geo/wkt.js';
import { GeoServerWfsService } from '../geoserver/geoserver-wfs.service.js';
import { toTrainingArea } from '../mappers/training-area.mapper.js';
import {
  TRAINING_AREAS_GEOMETRY,
  TRAINING_AREAS_TYPE_NAME,
  type TrainingArea,
  type TrainingAreaAttributes,
} from '../types/training-areas/types.js';

/**
 * Training areas live only in the GeoPackage GeoServer publishes, not in
 * PostGIS, so they are queried through WFS and GeoServer does the spatial
 * maths.
 */
@Injectable()
export class TrainingAreasService {
  constructor(private readonly geoServerWfs: GeoServerWfsService) {}

  /**
   * Touching a boundary counts as intersecting: for safety rules, the
   * conservative reading is the right one.
   */
  async findIntersecting(polygon: Polygon): Promise<TrainingArea[]> {
    // Coordinates are validated numbers, so the literal can't inject CQL.
    const cqlFilter = [
      `INTERSECTS(${TRAINING_AREAS_GEOMETRY}, ${polygonToEwkt(polygon)})`,
      'is_deleted = false',
    ].join(' AND ');

    const features =
      await this.geoServerWfs.getFeatures<TrainingAreaAttributes>(
        TRAINING_AREAS_TYPE_NAME,
        {
          cqlFilter,
          propertyNames: ['area_name', 'training_type', 'status'],
        },
      );

    return features.map(toTrainingArea);
  }
}
