import { Error, Types } from 'mongoose'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'

import { QuizSchema } from './quiz.schema'
import { QuizService } from './quiz.service'
import { UserSchema } from '../user/user.schema'

describe('QuizService', () => {
  let service: QuizService

  const quizDto = {
    question: 'What year was JavaScript released?',
    alternatives: ['1995', '1992', '2009', '1998', '1994'],
    correctAlternative: 0,
    createdBy: new Types.ObjectId().toString(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://0.0.0.0/quiz-test'),
        MongooseModule.forFeature([
          { name: 'Quiz', schema: QuizSchema },
          { name: 'User', schema: UserSchema },
        ]),
      ],
      providers: [QuizService],
    }).compile()

    service = module.get<QuizService>(QuizService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#create', () => {
    it('should not create Quiz with falsy params', async () => {
      expect.assertions(6)
      try {
        await service.create(null)
      } catch (error) {
        error = error as Error
        expect(error.name).toEqual('ValidationError')
        expect(error.errors).not.toBeNull()
        expect(error.errors.question).not.toBeNull()
        expect(error.errors.alternatives).not.toBeNull()
        expect(error.errors.correctAlternative).not.toBeNull()
        expect(error.errors.createdBy).not.toBeNull()
      }
    })

    it('should create Quiz', async () => {
      const quiz = await service.create(quizDto)
      expect(quiz).not.toBeNull()
      expect(quiz.question).toEqual(quizDto.question)
    })

    it('should find Quizzes by creator id', async () => {
      const quizzes = await service.findAllByUser(quizDto.createdBy)
      expect(quizzes).not.toBeNull()
      expect(quizzes[0]).not.toBeNull()
      expect(quizzes[0].question).toEqual(quizDto.question)
    })

    it('should find Quiz by id', async () => {
      const quizzes = await service.findAllByUser(quizDto.createdBy)
      expect(quizzes).not.toBeNull()
      expect(quizzes[0]).not.toBeNull()

      const quiz = await service.findById(quizzes[0]._id)
      expect(quiz).not.toBeNull()
      expect(quiz.question).toEqual(quizDto.question)
    })

    it('should delete Quiz', async () => {
      const quizzes = await service.findAllByUser(quizDto.createdBy)
      expect(quizzes).not.toBeNull()
      expect(quizzes[0]).not.toBeNull()

      const res = await service.delete(quizzes[0]._id, quizDto.createdBy)
      expect(res.deletedCount).toBe(1)
    })
  })
})
