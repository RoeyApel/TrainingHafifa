import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Polygon, Repository } from 'typeorm';
import { ForceDeployment } from '../entities/force-deployment.entity.js';
import { GeoServerWfsService } from '../geoserver/geoserver-wfs.service.js';
import type { FeatureProperties } from '../types/geo/types.js';
import { TrainingAreasService } from '../training-areas/training-areas.service.js';
import {
  type CreateForceDto,
  type ForceSaveResponseDto,
  type UpdateForceDto,
  FORCES_TYPE_NAME,
} from '../types/forces/types.js';
import {
  toFeatureId,
  toFeatureProperties,
  toForceId,
} from '../mappers/force-feature.mapper.js';
import { assessTrainingSafety } from './training-safety.js';
import { SafetyOutcome } from '../types/forces/enums.js';

type SavedSafety = Pick<ForceSaveResponseDto, 'outcome' | 'message'>;

/**
 * Business logic for force polygons (layer 2, פריסת כוחות).
 *
 * Every write goes through GeoServer WFS-T. The repository is used only for
 * reads. Before a polygon is saved it is checked against the training areas:
 * a maintenance area blocks the save, a live-fire area saves with a warning.
 */
@Injectable()
export class ForcesService {
  private readonly logger = new Logger(ForcesService.name);

  constructor(
    @InjectRepository(ForceDeployment)
    private readonly forcesRepository: Repository<ForceDeployment>,
    private readonly geoServerWfs: GeoServerWfsService,
    private readonly trainingAreas: TrainingAreasService,
  ) {}

  async create(force: CreateForceDto): Promise<ForceSaveResponseDto> {
    const safety = await this.assertSafeToSave(force.geom);

    const featureId = await this.geoServerWfs.insertFeature(FORCES_TYPE_NAME, {
      ...toFeatureProperties(force),
      is_deleted: false,
    });

    const id = toForceId(featureId);
    if (id === undefined) {
      // The row is saved, but its id can't be read back: the layer is likely
      // published under another name or without its primary key.
      this.logger.error(
        { featureId },
        'GeoServer returned an unexpected feature id',
      );
      throw new BadGatewayException(
        'GeoServer saved the force but returned an unexpected feature id',
      );
    }
    return { id, ...safety };
  }

  async update(
    id: number,
    changes: UpdateForceDto,
  ): Promise<ForceSaveResponseDto> {
    const properties = toFeatureProperties(changes);
    if (Object.values(properties).every((value) => value === undefined)) {
      throw new BadRequestException('No fields to update');
    }

    const existing = await this.findActiveOrThrow(id);
    // Attribute-only edits re-check the stored polygon: an area may have
    // closed for maintenance since the force was saved.
    const safety = await this.assertSafeToSave(changes.geom ?? existing.geom);

    await this.updateOrThrow(id, properties);
    return { id, ...safety };
  }

  /** Soft delete: the row stays, GeoServer's layer filter hides it. */
  async softDelete(id: number): Promise<void> {
    await this.findActiveOrThrow(id);
    await this.updateOrThrow(id, { is_deleted: true });
  }

  /** @throws ConflictException when the polygon overlaps a closed area. */
  private async assertSafeToSave(
    polygon: Polygon | null,
  ): Promise<SavedSafety> {
    const overlappingAreas = polygon
      ? await this.trainingAreas.findIntersecting(polygon)
      : [];
    const { outcome, message } = assessTrainingSafety(overlappingAreas);

    if (outcome === SafetyOutcome.Blocked) {
      throw new ConflictException(message);
    }
    return { outcome, message };
  }

  private async findActiveOrThrow(id: number): Promise<ForceDeployment> {
    const force = await this.forcesRepository.findOneBy({
      id,
      isDeleted: false,
    });
    if (!force) {
      throw new NotFoundException(`Force ${id} not found`);
    }
    return force;
  }

  private async updateOrThrow(
    id: number,
    properties: FeatureProperties,
  ): Promise<void> {
    const updated = await this.geoServerWfs.updateFeature(
      FORCES_TYPE_NAME,
      toFeatureId(id),
      properties,
    );
    // Deleted between the existence check and the write.
    if (updated === 0) {
      throw new NotFoundException(`Force ${id} not found`);
    }
  }
}
