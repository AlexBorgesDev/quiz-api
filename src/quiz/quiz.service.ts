import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Schema } from 'mongoose'

import { Quiz } from './quiz.interface'
import { CreateQuizDto } from './quiz.dto'

@Injectable()
export class QuizService {
  constructor(@InjectModel('Quiz') private readonly quizModel: Model<Quiz>) {}

  async create(doc: CreateQuizDto) {
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
