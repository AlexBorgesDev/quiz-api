import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common'

import { QuizService } from './quiz.service'
import { CreateQuizDto, DeleteQuizDto } from './quiz.dto'

@Controller('quiz')
export class QuizController {
  constructor(private readonly service: QuizService) {}

  @Post()
  async create(@Body() createQuizDto: CreateQuizDto, @Request() req: any) {
    const quiz = await this.service.create({
      ...createQuizDto,
      createdBy: req.user.id,
    })

    return {
      message: 'Quiz created successfully',
      quiz: {
        _id: quiz._id,
        question: quiz.question,
        alternatives: quiz.alternatives,
        correctAlternative: quiz.correctAlternative,
        __v: quiz.__v,
      },
    }
  }

  @Delete(':id')
  async delete(@Param() { id }: DeleteQuizDto, @Request() req: any) {
    const result = await this.service.delete(id, req.user.id)

    if (result.deletedCount === 0) throw new NotFoundException('Quiz not found')

    return { message: 'Quiz deleted successfully' }
  }
}
