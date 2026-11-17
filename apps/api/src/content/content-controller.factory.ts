import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query, type Type } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { ChangeStatusSchema, CONTENT_AUTHOR_ROLES, PublishingMetaSchema } from '@jfa/shared';
import type { RequestUser } from '../common/auth.types';
import { CurrentUser, Roles } from '../common/decorators';
import { ListQueryDto } from './content.dto';
import { contentServiceToken, type ContentTypeConfig } from './content-types';
import type { ContentWorkflowService } from './content-workflow.service';

/** Gives a generated DTO class a stable, unique name for the OpenAPI document. */
function named<T extends Type>(cls: T, name: string): T {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}

/**
 * Builds the staff CMS controller for one content type: list, get, create, update (drafts only)
 * and status changes. Bodies are validated against the type's shared Zod schema explicitly
 * (generated classes cannot rely on decorator type metadata).
 */
export function createContentController(type: ContentTypeConfig): Type {
  const createSchema = type.schema;
  const updateSchema = type.schema.partial();
  const responseSchema = type.schema.extend(PublishingMetaSchema.shape);

  const CreateDto = named(class extends createZodDto(createSchema) {}, `Create${type.label}Dto`);
  const UpdateDto = named(class extends createZodDto(updateSchema) {}, `Update${type.label}Dto`);
  const ResponseDto = named(class extends createZodDto(responseSchema) {}, `${type.label}ResponseDto`);
  const ListResponseDto = named(
    class extends createZodDto(z.object({ items: z.array(responseSchema), nextCursor: z.string().nullable() })) {},
    `${type.label}ListResponseDto`,
  );
  const ChangeStatusDto = named(class extends createZodDto(ChangeStatusSchema) {}, `Change${type.label}StatusDto`);

  @ApiTags('content')
  @Controller(`content/${type.key}`)
  @Roles(...CONTENT_AUTHOR_ROLES)
  class ContentController {
    constructor(@Inject(contentServiceToken(type.key)) readonly service: ContentWorkflowService) {}

    @Get()
    @ApiOkResponse({ type: ListResponseDto })
    list(@Query() query: ListQueryDto) {
      return this.service.list(query);
    }

    @Get(':id')
    @ApiOkResponse({ type: ResponseDto })
    get(@Param('id') id: string) {
      return this.service.get(id);
    }

    @Post()
    @ApiBody({ type: CreateDto })
    @ApiCreatedResponse({ type: ResponseDto })
    create(@Body(new ZodValidationPipe(createSchema)) body: Record<string, unknown>, @CurrentUser() user: RequestUser) {
      return this.service.create(body, user);
    }

    @Patch(':id')
    @ApiBody({ type: UpdateDto })
    @ApiOkResponse({ type: ResponseDto })
    update(
      @Param('id') id: string,
      @Body(new ZodValidationPipe(updateSchema)) body: Record<string, unknown>,
      @CurrentUser() user: RequestUser,
    ) {
      return this.service.update(id, body, user);
    }

    @Post(':id/status')
    @HttpCode(200)
    @ApiBody({ type: ChangeStatusDto })
    @ApiOkResponse({ type: ResponseDto })
    changeStatus(
      @Param('id') id: string,
      @Body(new ZodValidationPipe(ChangeStatusSchema)) body: z.infer<typeof ChangeStatusSchema>,
      @CurrentUser() user: RequestUser,
    ) {
      return this.service.changeStatus(id, body, user);
    }
  }

  return named(ContentController, `${type.label}sController`);
}
