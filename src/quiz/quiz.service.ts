import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Schema } from 'mongoose'

import { Quiz } from './quiz.interface'
import { CreateQuizDto } from './quiz.dto'
import { UserService } from '../user/user.service'

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('Quiz') private readonly quizModel: Model<Quiz>,
    private readonly userService: UserService,
  ) {}

  async create(
    doc: CreateQuizDto & { createdBy: string | Schema.Types.ObjectId },
  ) {
    const userExist = await this.userService.findById(doc.createdBy)
    if (!userExist) throw new UnauthorizedException()

    const quiz = await new this.quizModel(doc).save()
    return quiz
  }

  async delete(
    id: string | Schema.Types.ObjectId,
    userId: string | Schema.Types.ObjectId,
  ) {
    const result = await this.quizModel.deleteOne({
      _id: id,
      createdBy: userId,
    })

    return result
  }

  async findById(id: string | Schema.Types.ObjectId) {
    const result = await this.quizModel
      .findOne({ _id: id })
      .populate('createdBy')

    return result
  }

  async findAllByUser(userId: string | Schema.Types.ObjectId) {
    const results = await this.quizModel.find({ createdBy: userId })
    return results
  }
}
