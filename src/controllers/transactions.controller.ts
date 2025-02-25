import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  Req,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadTransactionsValidationPipe } from 'src/pipes/upload-transactions-validation.pipe';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { TransactionsService } from 'src/services/transactions.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import { ArrayOfIdsSchema } from 'src/validation/array-of-ids.schema';
import {
  CreateTransactionDto,
  CreateTransactionSchema,
  GetTransactionsQuery,
  GetTransactionsSchema,
  UpdateTransactionDto,
  UpdateTransactionSchema,
} from 'src/validation/transaction.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly t: TranslationService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTransactionSchema))
  async createTransaction(
    @Req() req: AuthenticationRequest,
    @Body() dto: CreateTransactionDto,
  ) {
    await this.transactionsService.createTransaction(dto, req.user);
    return {
      message: this.t.tMessage('created', 'transaction'),
    };
  }

  @Post('imports/bank-statements/:id')
  @UseInterceptors(FileInterceptor('file'))
  async importTransactions(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(new UploadTransactionsValidationPipe())
    file: Express.Multer.File,
  ) {
    await this.transactionsService.importTransactions(id, file, req.user);

    return {
      message: this.t.tMessage('imported', 'transaction_plural'),
    };
  }

  @Get(':id')
  async getTransactions(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(GetTransactionsSchema))
    query: GetTransactionsQuery,
  ) {
    return await this.transactionsService.getTransactions(id, query, req.user);
  }

  @Put(':id')
  async updateTransaction(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateTransactionSchema))
    dto: UpdateTransactionDto,
  ) {
    await this.transactionsService.updateTransaction(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'transaction'),
    };
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async deleteTransactions(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.transactionsService.deleteTransactions(dto, req.user);
    return {
      message: this.t.tMessage('removed_plural', 'transaction_plural'),
    };
  }
}
