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
  Put,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { CategoriesService } from 'src/services/categories.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  AssigningChangeDto,
  AssigningChangeSchema,
  CreateCategoryDto,
  CreateCategorySchema,
  MoveAvaliableDto,
  MoveAvaliableSchema,
  ReorderCategoriesDto,
  ReorderCategoriesSchema,
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

  @Post('reorder')
  @UsePipes(new ZodValidationPipe(ReorderCategoriesSchema))
  async reorderCategories(
    @Body()
    dto: ReorderCategoriesDto,
  ) {
    await this.categoriesService.reorderCategories(dto);
  }

  @Get('default/:id')
  async getDefaultCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.categoriesService.getDefaultCategory(id, req.user);
  }

  @Patch('assign/:id')
  async assigningChange(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AssigningChangeSchema)) dto: AssigningChangeDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoriesService.assigningChange(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'category'),
    };
  }

  @Put('move')
  @UsePipes(new ZodValidationPipe(MoveAvaliableSchema))
  async moveAvailable(
    @Req() req: AuthenticationRequest,
    @Body() dto: MoveAvaliableDto,
  ) {
    await this.categoriesService.moveAvailable(dto, req.user);
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
}
