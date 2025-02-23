import {
  Controller,
  Get,
  Param,
  Req,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AnalyticService } from 'src/services/analytic.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  AnalyticQueryDto,
  AnalyticQueryDtoType,
} from 'src/validation/analytic.schema';

@Controller('analytics')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get('expenses/:budgetId')
  async getExpensesByCategory(
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
    @Query(new ZodValidationPipe(AnalyticQueryDto)) query: AnalyticQueryDtoType,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.analyticService.getExpensesByCategory(
      budgetId,
      query,
      req.user,
    );
  }

  @Get('incomes/:budgetId')
  async getIncomesByCategory(
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
    @Query(new ZodValidationPipe(AnalyticQueryDto)) query: AnalyticQueryDtoType,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.analyticService.getIncomesByCategory(
      budgetId,
      query,
      req.user,
    );
  }
}
