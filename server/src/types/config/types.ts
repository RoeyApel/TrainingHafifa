import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { NodeEnv } from './enums.js';

export const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsIn(LOG_LEVELS)
  LOG_LEVEL: LogLevel = 'info';

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  // PostGIS is published on 5434, not 5432 (see infra/docker-compose.yml).
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5434;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  // require_tld: false allows http://localhost:8080/geoserver
  @IsUrl({ require_tld: false, require_protocol: true })
  GEOSERVER_URL: string;

  @IsString()
  @IsNotEmpty()
  GEOSERVER_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  GEOSERVER_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  GEOSERVER_WORKSPACE: string;

  // The workspace's namespace URI (Workspaces → <name> in the GeoServer UI).
  // WFS-T documents must qualify feature types with it.
  @IsUrl({ require_tld: false, require_protocol: true })
  GEOSERVER_NAMESPACE_URI: string;
}
