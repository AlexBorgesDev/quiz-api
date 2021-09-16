import { Body, Controller, Post, Request } from '@nestjs/common'

import { QuizService } from './quiz.service'
import { CreateQuizDto } from './quiz.dto'

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
}
