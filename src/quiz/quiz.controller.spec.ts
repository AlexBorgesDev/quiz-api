import { Types } from 'mongoose'
import { MongooseModule } from '@nestjs/mongoose'
import { internet, name } from 'faker'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'

import { QuizController } from './quiz.controller'
import { QuizSchema } from './quiz.schema'
import { QuizService } from './quiz.service'
import { UserModule } from '../user/user.module'
import { UserSchema } from '../user/user.schema'
import { UserService } from '../user/user.service'

describe('QuizController', () => {
  let controller: QuizController
  let userService: UserService

  let quizId: string

  const userDto = {
    name: name.findName(),
    email: internet.email(),
    password: internet.password(10),
  }

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
        UserModule,
      ],
      controllers: [QuizController],
      providers: [QuizService],
    }).compile()

    controller = module.get<QuizController>(QuizController)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#create', () => {
    it('should not create a Quiz if the User does not exist', async () => {
      try {
        await controller.create(quizDto, { user: { id: quizDto.createdBy } })
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should create Quiz', async () => {
      const userId = await userService.create(userDto)
      expect(userId).not.toBeNull()
      quizDto.createdBy = userId.toString()

      const quiz = await controller.create(quizDto, { user: { id: userId } })
      expect(quiz).not.toBeNull()
      expect(quiz.message).toEqual('Quiz created successfully')
      expect(quiz.quiz._id).not.toBeNull()
      quizId = quiz.quiz._id
      expect(quiz.quiz.question).toEqual(quizDto.question)
    })
  })

  it('should delete Quiz', async () => {
    expect(quizId).not.toBeNull()

    const res = await controller.delete(
      { id: quizId },
      { user: { id: quizDto.createdBy } },
    )

    expect(res).not.toBeNull()
    expect(res.message).toEqual('Quiz deleted successfully')
  })
})
