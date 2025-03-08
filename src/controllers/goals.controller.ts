import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { GoalsService } from 'src/services/goals.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateGoalDto,
  CreateGoalSchema,
  GetGoalQuery,
  GetGoalQuerySchema,
  UpdateGoalDto,
  UpdateGoalSchema,
} from 'src/validation/goal.schema';

@Controller('goals')
export class GoalsController {
  constructor(
    private readonly goalsService: GoalsService,
    private readonly t: TranslationService,
  ) {}

  @Get('/all/:id')
  async getGoals(
    @Query(new ZodValidationPipe(GetGoalQuerySchema)) query: GetGoalQuery,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.goalsService.getGoals(id, query, req.user);
  }

  @Get(':id')
  async getGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.goalsService.getGoal(id, req.user);
  }

  @Post(':id')
  async createGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CreateGoalSchema)) dto: CreateGoalDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.goalsService.createGoal({ budgetId: id, ...dto }, req.user);
    return {
      message: this.t.tMessage('created', 'goal'),
    };
  }

  @Patch(':id')
  async updateGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateGoalSchema)) dto: UpdateGoalDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.goalsService.updateGoal(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'goal'),
    };
  }

  @Delete(':id')
  async removeGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.goalsService.removeGoal(id, req.user);
    return {
      message: this.t.tMessage('removed', 'goal'),
    };
  }
}
