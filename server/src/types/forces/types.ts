import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { Polygon } from 'typeorm';
import { IsPolygon } from '../../common/geo/is-polygon.validator.js';
import { SRS_NAME } from '../geo/types.js';
import { SafetyOutcome } from './enums.js';

/** Layer 2 (פריסת כוחות) as GeoServer publishes it: `imunim:force_deployment`. */
export const FORCES_TYPE_NAME = 'force_deployment';

export const SAFETY_MESSAGES = {
  [SafetyOutcome.Blocked]: 'השטח המבוקש סגור לתחזוקה',
  [SafetyOutcome.Warning]: 'התראת בטיחות חמורה',
  [SafetyOutcome.Approved]: 'האימון נקבע בהצלחה',
} as const satisfies Record<SafetyOutcome, string>;

/** Matches the VARCHAR(100) columns of force_deployment. */
const MAX_NAME_LENGTH = 100;

/** Largest value of the INTEGER (int4) count columns. */
const MAX_COUNT = 2_147_483_647;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export interface SafetyAssessment {
  outcome: SafetyOutcome;
  message: string;
}

/** Optional attributes may be omitted or `null`: their columns are nullable. */
export class CreateForceDto {
  @ApiProperty({ example: 'גדוד 50', maxLength: MAX_NAME_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_NAME_LENGTH)
  unitName: string;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: 0,
    maximum: MAX_COUNT,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_COUNT)
  troopsCount?: number | null;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: 0,
    maximum: MAX_COUNT,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_COUNT)
  vehiclesCount?: number | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: MAX_NAME_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  commanderName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'date',
    example: '2026-11-20',
  })
  @IsOptional()
  @Matches(DATE_ONLY, { message: '$property must be a date (YYYY-MM-DD)' })
  @IsISO8601({ strict: true })
  trainingDate?: string | null;

  @ApiProperty({
    description: `GeoJSON Polygon in ${SRS_NAME} (meters)`,
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [672000, 3408000],
          [673500, 3408000],
          [673500, 3409500],
          [672000, 3408000],
        ],
      ],
    },
  })
  @IsPolygon()
  geom: Polygon;
}

/**
 * Partial edit: omitted fields stay unchanged. `skipNullProperties: false`
 * keeps `null` invalid for required fields (unitName, geom), while the
 * optional ones may still be cleared with `null`.
 */
export class UpdateForceDto extends PartialType(CreateForceDto, {
  skipNullProperties: false,
}) {}

/** Returned after a force was saved; `outcome` drives the message colour. */
export class ForceSaveResponseDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({
    enum: [SafetyOutcome.Approved, SafetyOutcome.Warning],
    description: 'approved → green message, warning → orange message',
  })
  outcome: SafetyOutcome.Approved | SafetyOutcome.Warning;

  @ApiProperty({ example: SAFETY_MESSAGES[SafetyOutcome.Approved] })
  message: string;
}
