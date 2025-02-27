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
import { AskDto, AskSchema } from 'src/validation/ai.schema';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('ask')
  @UsePipes(new ZodValidationPipe(AskSchema))
  async provideFinancialAdvice(@Body() dto: AskDto) {
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
