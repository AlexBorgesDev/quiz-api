import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { User } from './user.model'
import { CreateUserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(doc: CreateUserDto) {
    const result = await new this.userModel(doc).save()
    return result.id
  }

  async findByEmail(email: string) {
    const result = await this.userModel.findOne({ email })
    return result
  }
}
