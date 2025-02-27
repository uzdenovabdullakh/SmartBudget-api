import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AIService } from 'src/services/ai.service';
import {
  ProvideFinancialAdviceDto,
  ProvideFinancialAdviceSchema,
} from 'src/validation/ai.schema';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('provide-advice')
  @UsePipes(new ZodValidationPipe(ProvideFinancialAdviceSchema))
  async provideFinancialAdvice(@Body() dto: ProvideFinancialAdviceDto) {
    const answer = await this.aiService.provideFinancialAdvice(dto);
    return {
      answer,
    };
  }

  @Get('get-conversation/:id')
  async getConversationHistory(@Param('id', ParseUUIDPipe) id: string) {
    return await this.aiService.getConversationHistory(id);
  }
}
