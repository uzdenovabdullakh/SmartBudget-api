import { Body, Controller, Post, Req, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { BriefService } from 'src/services/brief.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  AnswerToBriefDto,
  AnswerToBriefSchema,
} from 'src/validation/brief.schema';

@Controller('brief')
export class BriefController {
  constructor(private readonly briefService: BriefService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(AnswerToBriefSchema))
  async processUserAnswers(
    @Body() dto: AnswerToBriefDto,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.briefService.processUserAnswers(dto, req.user);
  }
}
