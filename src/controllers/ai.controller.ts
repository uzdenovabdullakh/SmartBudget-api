import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AIService } from 'src/services/ai.service';
import {
  ProvideFinancialAdviceDto,
  ProvideFinancialAdviceSchema,
} from 'src/validation/ai.schema';
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
}
