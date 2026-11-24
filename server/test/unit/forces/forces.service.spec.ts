import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Polygon, Repository } from 'typeorm';
import type { ForceDeployment } from '../../../src/entities/force-deployment.entity.js';
import type { CreateForceDto } from '../../../src/types/forces/types.js';
import { ForcesService } from '../../../src/forces/forces.service.js';
import { SafetyOutcome } from '../../../src/types/forces/enums.js';
import type { GeoServerWfsService } from '../../../src/geoserver/geoserver-wfs.service.js';
import { type TrainingArea } from '../../../src/types/training-areas/types.js';
import {
  TrainingAreaStatus,
  TrainingType,
} from '../../../src/types/training-areas/enums.js';
import type { TrainingAreasService } from '../../../src/training-areas/training-areas.service.js';

const polygon: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [672000, 3408000],
      [673000, 3408000],
      [673000, 3409000],
      [672000, 3408000],
    ],
  ],
};

const newForce: CreateForceDto = { unitName: 'גדוד 50', geom: polygon };

const liveFireArea: TrainingArea = {
  areaName: 'אש חיה 1',
  trainingType: TrainingType.LiveFire,
  status: TrainingAreaStatus.Active,
};

const maintenanceArea: TrainingArea = {
  areaName: 'לייזר 1',
  trainingType: TrainingType.Laser,
  status: TrainingAreaStatus.Maintenance,
};

const storedForce = { id: 7, isDeleted: false, geom: polygon };

describe('ForcesService', () => {
  const findOneBy =
    jest.fn<(where: object) => Promise<ForceDeployment | null>>();
  const insertFeature = jest.fn<GeoServerWfsService['insertFeature']>();
  const updateFeature = jest.fn<GeoServerWfsService['updateFeature']>();
  const findIntersecting = jest.fn<TrainingAreasService['findIntersecting']>();

  const service = new ForcesService(
    { findOneBy } as unknown as Repository<ForceDeployment>,
    { insertFeature, updateFeature } as unknown as GeoServerWfsService,
    { findIntersecting } as unknown as TrainingAreasService,
  );

  beforeEach(() => {
    findOneBy.mockResolvedValue(storedForce as ForceDeployment);
    insertFeature.mockResolvedValue('force_deployment.7');
    updateFeature.mockResolvedValue(1);
    findIntersecting.mockResolvedValue([]);
  });

  describe('create', () => {
    it('saves through WFS-T and approves when no training area is hit', async () => {
      await expect(service.create(newForce)).resolves.toEqual({
        id: 7,
        outcome: SafetyOutcome.Approved,
        message: 'האימון נקבע בהצלחה',
      });
      expect(insertFeature).toHaveBeenCalledWith(
        'force_deployment',
        expect.objectContaining({
          unit_name: 'גדוד 50',
          geom: polygon,
          is_deleted: false,
        }),
      );
    });

    it('saves but warns when the force overlaps a live-fire area', async () => {
      findIntersecting.mockResolvedValue([liveFireArea]);

      await expect(service.create(newForce)).resolves.toMatchObject({
        outcome: SafetyOutcome.Warning,
      });
      expect(insertFeature).toHaveBeenCalledTimes(1);
    });

    it('refuses to save over an area closed for maintenance', async () => {
      findIntersecting.mockResolvedValue([liveFireArea, maintenanceArea]);

      await expect(service.create(newForce)).rejects.toThrow(
        new ConflictException('השטח המבוקש סגור לתחזוקה'),
      );
      expect(insertFeature).not.toHaveBeenCalled();
    });

    it('reports a 502 when GeoServer returns a feature id it cannot read', async () => {
      insertFeature.mockResolvedValue('forces.fid-1a2b');

      await expect(service.create(newForce)).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('update', () => {
    it('sends only the changed attributes', async () => {
      await service.update(7, { commanderName: 'סרן לוי' });

      expect(updateFeature).toHaveBeenCalledWith(
        'force_deployment',
        'force_deployment.7',
        expect.objectContaining({
          commander_name: 'סרן לוי',
          unit_name: undefined,
          geom: undefined,
        }),
      );
    });

    it('checks the new polygon when the geometry changes', async () => {
      findIntersecting.mockResolvedValue([maintenanceArea]);

      await expect(service.update(7, { geom: polygon })).rejects.toThrow(
        ConflictException,
      );
      expect(updateFeature).not.toHaveBeenCalled();
    });

    it('rejects an empty edit', async () => {
      await expect(service.update(7, {})).rejects.toThrow(BadRequestException);
    });

    it('returns 404 for a missing or soft-deleted force', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.update(7, { unitName: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(findOneBy).toHaveBeenCalledWith({ id: 7, isDeleted: false });
    });
  });

  describe('softDelete', () => {
    it('sets is_deleted instead of deleting the feature', async () => {
      await service.softDelete(7);

      expect(updateFeature).toHaveBeenCalledWith(
        'force_deployment',
        'force_deployment.7',
        { is_deleted: true },
      );
    });

    it('returns 404 when GeoServer updated nothing', async () => {
      updateFeature.mockResolvedValue(0);

      await expect(service.softDelete(7)).rejects.toThrow(NotFoundException);
    });
  });
});
