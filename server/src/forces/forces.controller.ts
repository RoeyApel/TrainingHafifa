import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateForceDto,
  ForceSaveResponseDto,
  UpdateForceDto,
} from '../types/forces/types.js';
import { ForcesService } from './forces.service.js';

const BLOCKED = 'Overlaps a training area closed for maintenance; not saved';
const GEOSERVER_FAILED = 'GeoServer failed or is unreachable';

@ApiTags('forces')
@ApiBadRequestResponse({ description: 'Invalid request body or id' })
@ApiBadGatewayResponse({ description: GEOSERVER_FAILED })
@Controller('forces')
export class ForcesController {
  constructor(private readonly forcesService: ForcesService) {}

  @Post()
  @ApiCreatedResponse({ type: ForceSaveResponseDto })
  @ApiConflictResponse({ description: BLOCKED })
  create(@Body() force: CreateForceDto): Promise<ForceSaveResponseDto> {
    return this.forcesService.create(force);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ForceSaveResponseDto })
  @ApiConflictResponse({ description: BLOCKED })
  @ApiNotFoundResponse({ description: 'No active force with this id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateForceDto,
  ): Promise<ForceSaveResponseDto> {
    return this.forcesService.update(id, changes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Force soft-deleted' })
  @ApiNotFoundResponse({ description: 'No active force with this id' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.forcesService.softDelete(id);
  }
}
