import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UsePipes,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AccountsService } from 'src/services/accounts.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateAccountDto,
  CreateAccountSchema,
  UpdateAccountDto,
  UpdateAccountSchema,
} from 'src/validation/account.schema';
import {
  PaginationQueryDto,
  PaginationQuerySchema,
} from 'src/validation/pagination.schema';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountService: AccountsService,
    private readonly t: TranslationService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccountSchema))
  async createAccount(
    @Body() dto: CreateAccountDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.accountService.createAccount(dto, req.user);
    return {
      message: this.t.tMessage('created', 'account'),
    };
  }

  @Get('list/:budgetId')
  async getAccounts(
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQueryDto,
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.accountService.getUserAccounts({
      budgetId,
      user: req.user,
      query,
    });
  }

  @Get(':id')
  async getAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.accountService.getUserAccount(id, req.user);
  }

  @Delete(':id')
  async deleteAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.accountService.deleteAccount(id, req.user);
    return {
      message: this.t.tMessage('removed', 'account'),
    };
  }

  @Patch(':id')
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
    @Body(new ZodValidationPipe(UpdateAccountSchema)) dto: UpdateAccountDto,
  ) {
    await this.accountService.updateAccount(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'account'),
    };
  }
}
