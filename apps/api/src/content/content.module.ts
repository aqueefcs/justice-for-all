import { Body, Controller, Get, HttpCode, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { modelDefinitions } from '@jfa/db';
import { CONTENT_AUTHOR_ROLES } from '@jfa/shared';
import type { RequestUser } from '../common/auth.types';
import { CurrentUser, Roles } from '../common/decorators';
import {
  CategoryListResponseDto,
  ChangeStatusDto,
  CreateGuideDto,
  GuideListResponseDto,
  GuideResponseDto,
  ListQueryDto,
  UpdateGuideDto,
} from './content.dto';
import { GuidesService } from './guides.service';
import { toResponse } from './to-response';

/**
 * Staff-facing content API (CMS). Citizens never call this — they read content packs (ADR 0003).
 */
@ApiTags('content')
@Controller('content/guides')
@Roles(...CONTENT_AUTHOR_ROLES)
export class GuidesController {
  constructor(private readonly guides: GuidesService) {}

  @Get()
  @ApiOkResponse({ type: GuideListResponseDto })
  list(@Query() query: ListQueryDto) {
    return this.guides.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: GuideResponseDto })
  get(@Param('id') id: string) {
    return this.guides.get(id);
  }

  @Post()
  @ApiCreatedResponse({ type: GuideResponseDto })
  create(@Body() body: CreateGuideDto, @CurrentUser() user: RequestUser) {
    return this.guides.create(body, user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: GuideResponseDto })
  update(@Param('id') id: string, @Body() body: UpdateGuideDto, @CurrentUser() user: RequestUser) {
    return this.guides.update(id, body, user);
  }

  @Post(':id/status')
  @HttpCode(200)
  @ApiOkResponse({ type: GuideResponseDto })
  changeStatus(@Param('id') id: string, @Body() body: ChangeStatusDto, @CurrentUser() user: RequestUser) {
    return this.guides.changeStatus(id, body, user);
  }
}

@ApiTags('content')
@Controller('content/categories')
@Roles(...CONTENT_AUTHOR_ROLES)
export class CategoriesController {
  constructor(@InjectModel('Category') private readonly categories: Model<{ _id: unknown }>) {}

  @Get()
  @ApiOkResponse({ type: CategoryListResponseDto })
  async list() {
    const docs = await this.categories.find().sort({ order: 1 }).limit(200).lean();
    return { items: docs.map((d) => toResponse(d as { _id: unknown })) };
  }
}

// TODO(Phase 1): ArticlesController, ActsController (+ India Code import), TemplatesController — same pattern.

@Module({
  imports: [MongooseModule.forFeature(modelDefinitions(['Guide', 'Category']))],
  controllers: [GuidesController, CategoriesController],
  providers: [GuidesService],
})
export class ContentModule {}
