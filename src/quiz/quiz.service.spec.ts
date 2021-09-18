import { Error, Types } from 'mongoose'
import { internet, name } from 'faker'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { QuizSchema } from './quiz.schema'
import { QuizService } from './quiz.service'
import { UserSchema } from '../user/user.schema'
import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'
import { validationTestSchema as validationSchema } from '../config/validation-test'

describe('QuizService', () => {
  let service: QuizService
  let userService: UserService

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
        ConfigModule.forRoot({ isGlobal: true, validationSchema }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_URL_TEST'),
          }),
        }),
        MongooseModule.forFeature([
          { name: 'Quiz', schema: QuizSchema },
          { name: 'User', schema: UserSchema },
        ]),
        UserModule,
      ],
      providers: [QuizService],
    }).compile()

    service = module.get<QuizService>(QuizService)
    userService = module.get<UserService>(UserService)
  })

  afterAll(async () => {
    await userService.delete(quizDto.createdBy)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#create', () => {
    it('should not create a Quiz if the User does not exist', async () => {
      expect.assertions(3)
      try {
        await service.create(quizDto)
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should not create Quiz with falsy params', async () => {
      expect.assertions(6)

      const userId = await userService.create(userDto)
      expect(userId).not.toBeNull()

      quizDto.createdBy = userId.toString()

      try {
        await service.create({ createdBy: userId } as any)
      } catch (error) {
        error = error as Error
        expect(error.name).toEqual('ValidationError')
        expect(error.errors).not.toBeNull()
        expect(error.errors.question).not.toBeNull()
        expect(error.errors.alternatives).not.toBeNull()
        expect(error.errors.correctAlternative).not.toBeNull()
      }
    })

    it('should create Quiz', async () => {
      const quiz = await service.create(quizDto)
      expect(quiz).not.toBeNull()
      expect(quiz.question).toEqual(quizDto.question)
    })
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
