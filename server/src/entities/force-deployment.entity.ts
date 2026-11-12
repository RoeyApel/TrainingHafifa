import {
  Column,
  Entity,
  Index,
  type Polygon,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SRID } from '../common/geo/spatial-reference.js';

/**
 * GeoServer publishes this table as `imunim:force_deployment`.
 *
 * Column, index and constraint names match the existing table exactly, so
 * TypeORM's synchronize leaves the table (and GeoServer's layer) untouched.
 */
@Entity({ name: 'force_deployment' })
export class ForceDeployment {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'force_deployment_pkey' })
  id: number;

  @Column({ name: 'unit_name', type: 'varchar', length: 100 })
  unitName: string;

  @Column({ name: 'troops_count', type: 'integer', nullable: true })
  troopsCount: number | null;

  @Column({ name: 'vehicles_count', type: 'integer', nullable: true })
  vehiclesCount: number | null;

  @Column({
    name: 'commander_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  commanderName: string | null;

  // The pg driver returns DATE columns as 'YYYY-MM-DD' strings, not Date objects.
  @Column({ name: 'training_date', type: 'date', nullable: true })
  trainingDate: string | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Index('idx_force_deployment_geom', { spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: SRID,
    nullable: true,
  })
  geom: Polygon | null;
}
