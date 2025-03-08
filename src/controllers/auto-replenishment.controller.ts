import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  UsePipes,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AutoReplenishmentService } from 'src/services/auto-replenishment.service';
import { TranslationService } from 'src/services/translation.service';
import {
  CreateAutoReplenishmentSchema,
  CreateAutoReplenishmentDto,
  UpdateAutoReplenishmentSchema,
  UpdateAutoReplenishmentDto,
} from 'src/validation/auto-replenishment.schema';

@Controller('auto-replenishments')
export class AutoReplenishmentController {
  constructor(
    private readonly autoReplenishmentService: AutoReplenishmentService,
    private readonly t: TranslationService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAutoReplenishmentSchema))
  async create(@Body() dto: CreateAutoReplenishmentDto) {
    await this.autoReplenishmentService.create(dto);
    return {
      message: this.t.tMessage('created', 'auto_replenishment'),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateAutoReplenishmentSchema))
    dto: UpdateAutoReplenishmentDto,
  ) {
    await this.autoReplenishmentService.update(id, dto);
    return {
      message: this.t.tMessage('updated', 'auto_replenishment'),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.autoReplenishmentService.deactivate(id);
    return {
      message: this.t.tMessage('deactivate', 'auto_replenishment'),
    };
  }
}
