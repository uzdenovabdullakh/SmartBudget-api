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
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { CategoryGroupsService } from 'src/services/category-groups.service';
import { TranslationService } from 'src/services/translation.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateCategoryGroupDto,
  CreateCategoryGroupSchema,
  UpdateCategoryGroupDto,
  UpdateCategoryGroupSchema,
} from 'src/validation/category-group.schema';

@Controller('category-groups')
export class CategoryGroupsController {
  constructor(
    private readonly categoryGroupsService: CategoryGroupsService,
    private readonly t: TranslationService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCategoryGroupSchema))
  async createCategoryGroup(@Body() dto: CreateCategoryGroupDto) {
    await this.categoryGroupsService.createCategoryGroup(dto);
    return {
      message: this.t.tMessage('created', 'category_group'),
    };
  }

  @Get(':id')
  async getGroupsWithCategories(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.categoryGroupsService.getGroupsWithCategories(
      id,
      req.user,
    );
  }

  @Get('removed')
  async getRemovedCategoriesGroup(@Req() req: AuthenticationRequest) {
    return await this.categoryGroupsService.getRemovedCategoriesGroup(req.user);
  }

  @Delete(':id')
  async removeCategoryGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoryGroupsService.removeCategoryGroup(id, req.user);
    return {
      message: this.t.tMessage('removed', 'category_group'),
    };
  }

  @Post('restore:id')
  async restoreCategoryGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoryGroupsService.restoreCategoryGroup(id, req.user);
    return {
      message: this.t.tMessage('restored', 'category'),
    };
  }

  @Patch(':id')
  async updateCategoryGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCategoryGroupSchema))
    dto: UpdateCategoryGroupDto,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoryGroupsService.updateCategoryGroup(id, dto, req.user);
    return {
      message: this.t.tMessage('updated', 'category_group'),
    };
  }
}
