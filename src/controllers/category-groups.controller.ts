import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { HttpMessage } from 'src/constants/constants';
import { ZodValidationPipe } from 'src/pipes/validation-pipe';
import { CategoryGroupsService } from 'src/services/category-groups.service';
import { AuthenticationRequest } from 'src/types/authentication-request.types';
import {
  CreateCategoryGroupDto,
  CreateCategoryGroupSchema,
} from 'src/validation/category-group.schema';

@Controller('category-groups')
export class CategoryGroupsController {
  constructor(private readonly categoryGroupsService: CategoryGroupsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCategoryGroupSchema))
  async createCategoryGroup(@Body() dto: CreateCategoryGroupDto) {
    const data = await this.categoryGroupsService.createCategoryGroup(dto);
    return {
      data,
      message: HttpMessage.CREATE('Category group'),
    };
  }

  @Get(':id')
  async getCategoriesGroups(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.categoryGroupsService.getCategoriesGroups(id, req.user);
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
      message: HttpMessage.DELETE('Category group'),
    };
  }

  @Post('restore:id')
  async restoreCategoryGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticationRequest,
  ) {
    await this.categoryGroupsService.restoreCategoryGroup(id, req.user);
    return {
      message: HttpMessage.RESTORE('Category group'),
    };
  }
}
