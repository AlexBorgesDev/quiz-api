import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common'
import { CreateCollectionDto, DeleteCollectionDto } from './collection.dto'

import { CollectionService } from './collection.service'

@Controller('collection')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Post()
  async create(@Body() collection: CreateCollectionDto, @Request() req: any) {
    const result = await this.service.create({
      ...collection,
      createdBy: req.user.id,
    })

    return {
      message: 'Collection created successfully',
      collection: {
        _id: result._id,
        name: result.name,
        quizzes: result.quizzes,
        isPublic: result.isPublic,
        __v: result.__v,
      },
    }
  }

  @Delete(':id')
  async delete(@Param() { id }: DeleteCollectionDto, @Request() req: any) {
    const result = await this.service.delete(id, req.user.id)

    if (result.deletedCount === 0) {
      throw new NotFoundException('Collection not found')
    }

    return { message: 'Collection deleted successfully' }
  }
}
