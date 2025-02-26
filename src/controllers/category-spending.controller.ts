import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { CategorySpendingService } from 'src/services/category-spending.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CategoryLimitSchema,
  CategoryLimitDto,
  UpdateCategoryLimitDto,
  UpdateCategoryLimitSchema,
} from 'src/validation/category-limit.schema';

@Controller('category-limit')
export class CategorySpendingController {
  constructor(
    private readonly categorySpendingService: CategorySpendingService,
    private readonly t: TranslationService,
  ) {}

  @Post(':id')
  async setCategoryLimit(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CategoryLimitSchema)) dto: CategoryLimitDto,
  ) {
    await this.categorySpendingService.setCategoryLimit(id, dto, req.user);
    return {
      message: this.t.tMessage('created', 'category_limit'),
    };
  }

  @Get(':id')
  async getCategoryLimit(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const limit = await this.categorySpendingService.getCategoryLimit(
      id,
      req.user,
    );
    return limit;
  }

  @Patch(':id')
  async updateCategoryLimit(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCategoryLimitSchema))
    dto: UpdateCategoryLimitDto,
  ) {
    await this.categorySpendingService.updateCategoryLimit(id, dto);
    return {
      message: this.t.tMessage('updated', 'category_limit'),
    };
  }

  @Delete(':id')
  async deleteCategoryLimit(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.categorySpendingService.deleteCategoryLimit(id);
    return {
      message: this.t.tMessage('removed', 'category_limit'),
    };
  }
}
