import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AIService } from 'src/services/ai.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  AutoCategorizeDto,
  AutoCategorizeSchema,
  ProvideFinancialAdviceDto,
  ProvideFinancialAdviceSchema,
} from 'src/validation/ai.schema';
import { ArrayOfIdsSchema } from 'src/validation/array-of-ids.schema';
import {
  PaginationQuerySchema,
  PaginationQueryDto,
} from 'src/validation/pagination.schema';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('provide-advice')
  @UsePipes(new ZodValidationPipe(ProvideFinancialAdviceSchema))
  async provideFinancialAdvice(@Body() dto: ProvideFinancialAdviceDto) {
    return await this.aiService.provideFinancialAdvice(dto);
  }

  @Get('get-conversation/:id')
  async getConversationHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQueryDto,
  ) {
    const { page, pageSize } = query;
    return await this.aiService.getConversationHistory(id, page, pageSize);
  }

  @Post('categorize')
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async categorize(@Req() req: AuthenticationRequest, @Body() dto: string[]) {
    return await this.aiService.categorize(dto, req.user);
  }

  @Post('auto-categorize')
  @UsePipes(new ZodValidationPipe(AutoCategorizeSchema))
  async autoCategorize(
    @Req() req: AuthenticationRequest,
    @Body() dto: AutoCategorizeDto,
  ) {
    return await this.aiService.autoCategorize(dto, req.user);
  }
}
