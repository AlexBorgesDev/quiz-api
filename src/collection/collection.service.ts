import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Schema } from 'mongoose'

import { Collection } from './collection.interface'
import { CreateCollectionDto } from './collection.dto'
import { UserService } from '../user/user.service'

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel('Collection')
    private readonly collectionModel: Model<Collection>,
    private readonly userService: UserService,
  ) {}

  async create(
    doc: CreateCollectionDto & { createdBy: string | Schema.Types.ObjectId },
  ) {
    const userExist = await this.userService.findById(doc.createdBy)
    if (!userExist) throw new UnauthorizedException()

    const result = await new this.collectionModel(doc).save()
    return result
  }

  async delete(
    id: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId,
  ) {
    const result = await this.collectionModel.deleteOne({
      _id: id,
      createdBy: userId,
    })

    return result
  }

  async findByUserId(id: string | Schema.Types.ObjectId) {
    const results = await this.collectionModel.find({ createdBy: id })
    return results
  }
}
