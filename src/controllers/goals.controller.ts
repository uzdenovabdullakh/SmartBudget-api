import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { HttpMessage } from 'src/constants/constants';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { GoalsService } from 'src/services/goals.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateGoalDto,
  CreateGoalSchema,
  UpdateGoalDto,
  UpdateGoalSchema,
} from 'src/validation/goal.schema';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGoalSchema))
  async createGoal(
    @Body() dto: CreateGoalDto,
    @Req() req: AuthenticationRequest,
  ) {
    const data = await this.goalsService.createGoal(dto, req.user);
    return {
      data,
      message: HttpMessage.CREATE('Goal'),
    };
  }

  @Patch(':id')
  async updateGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateGoalSchema)) dto: UpdateGoalDto,
    @Req() req: AuthenticationRequest,
  ) {
    const data = await this.goalsService.updateGoal(id, dto, req.user);
    return {
      data,
      message: HttpMessage.UPDATE('Goal'),
    };
  }

  @Delete(':id')
  async removeGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.goalsService.removeGoal(id, req.user);
    return {
      message: HttpMessage.DELETE('Goal'),
    };
  }
}
