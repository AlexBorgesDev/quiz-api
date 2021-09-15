import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Schema } from 'mongoose'

import { User } from './user.interface'
import { CreateUserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(doc: CreateUserDto) {
    const result = await new this.userModel(doc).save()
    return result.id as string | Schema.Types.ObjectId
  }

  async delete(id: string | Schema.Types.ObjectId) {
    const result = await this.userModel.deleteOne({ _id: id })
    return result
  }

  async findByEmail(email: string) {
    const result = await this.userModel.findOne({ email })
    return result
  }
}
