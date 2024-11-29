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
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { AccountsService } from 'src/services/accounts.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateUnlinkedAccountDto,
  CreateUnlinkedAccountSchema,
} from 'src/validation/account.schema';
import { ArrayOfIdsSchema } from 'src/validation/array-of-ids.schema';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Post('unlinked-account')
  @UsePipes(new ZodValidationPipe(CreateUnlinkedAccountSchema))
  async createUnlinkedAccount(
    @Body() dto: CreateUnlinkedAccountDto,
    @Req() req: AuthenticationRequest,
  ) {
    const data = await this.accountService.createUnlinkedAccount(dto, req.user);
    return {
      data,
      message: 'Unlikned account was successfully created',
    };
  }

  @Get('list/:budgetId')
  async getAccounts(
    @Param('budgetId', ParseUUIDPipe) budgetId: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.accountService.getUserAccounts(budgetId, req.user);
  }

  @Get('removed')
  async getRemovedAccounts(@Req() req: AuthenticationRequest) {
    return await this.accountService.getRemovedAccounts(req.user);
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
      message: 'Account was successfully removed',
    };
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async deleteForever(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.accountService.deleteForever(dto, req.user);
    return {
      message: 'Accounts was successfully removed',
    };
  }

  @Post('restore')
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async restoreAccounts(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.accountService.restoreAccounts(dto, req.user);
    return {
      message: 'Accounts was successfully restored',
    };
  }
}
