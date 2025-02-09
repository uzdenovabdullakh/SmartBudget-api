import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { CategoriesService } from 'src/services/categories.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import { ArrayOfIdsSchema } from 'src/validation/array-of-ids.schema';
import {
  CategoryLimitDto,
  CategoryLimitSchema,
  CreateCategoryDto,
  CreateCategorySchema,
  UpdateCategoryDto,
  UpdateCategorySchema,
} from 'src/validation/category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly t: TranslationService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCategorySchema))
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoriesService.createCategory(dto, req.user);
    return {
      message: this.t.tMessage('created', 'category'),
    };
  }

  @Get(':id')
  async getCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.categoriesService.getCategory(id, req.user);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoriesService.updateCategory(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'category'),
    };
  }

  @Delete(':id')
  async removeCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoriesService.removeCategory(id, req.user);
    return {
      message: this.t.tMessage('removed', 'category'),
    };
  }

  @Delete()
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async removeCategoriesForever(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.categoriesService.deleteForever(dto, req.user);
    return {
      message: this.t.tMessage('removed_plural', 'category_plural'),
    };
  }

  @Post('restore')
  @UsePipes(new ZodValidationPipe(ArrayOfIdsSchema))
  async restoreCategories(
    @Req() req: AuthenticationRequest,
    @Body() dto: string[],
  ) {
    await this.categoriesService.restoreCategories(dto, req.user);
    return {
      message: this.t.tMessage('restored_plural', 'category_plural'),
    };
  }

  @Post('category-limit/:id')
  async setCategoryLimit(
    @Req() req: AuthenticationRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CategoryLimitSchema)) dto: CategoryLimitDto,
  ) {
    await this.categoriesService.setCategoryLimit(id, dto, req.user);
    return {
      message: this.t.tMessage('created', 'category_limit'),
    };
  }
}
