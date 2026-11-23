import type { Server } from 'node:http';
import { Global, type INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { DatabaseModule } from '../../src/database/database.module.js';

// The database is swapped for a fake DataSource so e2e tests need no Postgres.
// It only has to satisfy the repository factories of TypeOrmModule.forFeature.
@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useValue: { entityMetadatas: [], options: {}, getRepository: () => ({}) },
    },
  ],
  exports: [DataSource],
})
class StubDatabaseModule {}

describe('App (e2e)', () => {
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(StubDatabaseModule)
      .compile();

    app = moduleRef.createNestApplication<INestApplication<Server>>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health reports ok', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  // Validation runs before any GeoServer call, so these need no GeoServer.
  describe('/forces validation', () => {
    const geom = {
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

    it('POST rejects a polygon in degrees instead of EPSG:32636', async () => {
      const degrees = {
        type: 'Polygon',
        coordinates: [
          [
            [34.8, 31.2],
            [34.9, 31.2],
            [34.9, 31.3],
            [34.8, 31.2],
          ],
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/forces')
        .send({ unitName: 'גדוד 50', geom: degrees })
        .expect(400);

      expect(response.body.message).toEqual([
        expect.stringContaining('inside the bounds of EPSG:32636'),
      ]);
    });

    it('POST rejects a self-intersecting polygon, naming the point', async () => {
      const bowTie = {
        type: 'Polygon',
        coordinates: [
          [
            [700000, 3550000],
            [701000, 3550000],
            [700000, 3551000],
            [701000, 3551000],
            [700000, 3550000],
          ],
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/forces')
        .send({ unitName: 'גדוד 50', geom: bowTie })
        .expect(400);

      expect(response.body.message).toEqual([
        'geom must be a valid GeoJSON Polygon in EPSG:32636: Self-intersection at (700500, 3550500)',
      ]);
    });

    it('POST rejects unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/forces')
        .send({ unitName: 'גדוד 50', geom, isDeleted: true })
        .expect(400);
    });

    it('POST rejects a count larger than the INTEGER column holds', async () => {
      await request(app.getHttpServer())
        .post('/forces')
        .send({ unitName: 'גדוד 50', troopsCount: 2_147_483_648, geom })
        .expect(400);
    });

    it('PATCH rejects null for a required field', async () => {
      await request(app.getHttpServer())
        .patch('/forces/1')
        .send({ unitName: null })
        .expect(400);
    });

    it('DELETE rejects a non-numeric id', async () => {
      await request(app.getHttpServer()).delete('/forces/abc').expect(400);
    });
  });
});
