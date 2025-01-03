import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BudgetsService } from 'src/services/budgets.service';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateBudgetSchema,
  CreateBudgetDto,
  UpdateBudgetSchema,
  UpdateBudgetDto,
} from 'src/validation/budget.schema';
import { ArrayOfIdsSchema } from 'src/validation/array-of-ids.schema';
import { HttpMessage } from 'src/constants/constants';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetService: BudgetsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateBudgetSchema))
  async createBudget(
    @Body() dto: CreateBudgetDto,
    @Req() req: AuthenticationRequest,
  ) {
    const data = await this.budgetService.createBudget(dto, req.user);
    return {
      data,
      message: HttpMessage.CREATE('Budget'),
    };
  }

  @Get()
  async getBudgets(@Req() req: AuthenticationRequest) {
    return await this.budgetService.getUserBudgets(req.user);
  }

  @Get('removed')
  async getRemovedBudgets(@Req() req: AuthenticationRequest) {
    return await this.budgetService.getRemovedBudgets(req.user);
  }

  @Get(':id')
  async getBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.budgetService.getUserBudget(id, req.user);
  }

  @Put(':id')
  async updateBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateBudgetSchema)) dto: UpdateBudgetDto,
    @Req() req: AuthenticationRequest,
  ) {
    const data = await this.budgetService.updateBudget(id, dto, req.user);
    return {
      data,
      message: HttpMessage.UPDATE('Budget'),
    };
  }

  @Delete(':id')
  async deleteBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.budgetService.deleteBudget(id, req.user);
    return {
      message: HttpMessage.DELETE('Budget'),
    };
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async deleteForever(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.budgetService.deleteForever(dto, req.user);
    return {
      message: HttpMessage.DELETE_PLURAL('Budget'),
    };
  }

  @Post('restore')
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async restoreBudgets(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.budgetService.restoreBudgets(dto, req.user);
    return {
      message: HttpMessage.RESTORE('Budget'),
    };
  }
}
