import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForcesService } from './forces.service.js';

/**
 * TODO:
 * - POST   /forces       create a force
 * - PATCH  /forces/:id   edit a force
 * - DELETE /forces/:id   soft delete (is_deleted = true), not a real delete
 */
@ApiTags('forces')
@Controller('forces')
export class ForcesController {
  constructor(private readonly forcesService: ForcesService) {}
}
