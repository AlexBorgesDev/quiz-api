import * as request from 'supertest'

import { Types } from 'mongoose'
import { internet, name } from 'faker'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { INestApplication, ValidationPipe } from '@nestjs/common'

import { AppModule } from '../src/app.module'
import { QuizService } from '../src/quiz/quiz.service'
import { UserService } from '../src/user/user.service'
import { validationTestSchema } from '../src/config/validation-test'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let service: QuizService
  let jwtService: JwtService
  let userService: UserService

  let token: string

  const userDto = {
    name: name.findName(),
    email: internet.email(),
    password: internet.password(10),
  }

  const quizDto = {
    question: 'What year was JavaScript released?',
    alternatives: ['1995', '1992', '2009', '1998', '1994'],
    correctAlternative: 1,
    createdBy: new Types.ObjectId().toString(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: validationTestSchema,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_URL_TEST'),
          }),
        }),
        AppModule,
      ],
    }).compile()

    userService = moduleFixture.get<UserService>(UserService)
    jwtService = moduleFixture.get<JwtService>(JwtService)
    service = moduleFixture.get<QuizService>(QuizService)
    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  afterAll(async () => {
    const user = await userService.findByEmail(userDto.email)
    await userService.delete(user.id)
  })

  describe('/quiz (POST)', () => {
    it('should not create a Quiz without being authenticated', () => {
      return request(app.getHttpServer()).post('/quiz').expect(401).expect({
        statusCode: 401,
        message: 'Unauthorized',
      })
    })

    it('should not create a Quiz with invalid data', async () => {
      const user = await userService.create(userDto)
      expect(user).not.toBeNull()

      quizDto.createdBy = user.toString()
      token = jwtService.sign({ id: user })

      return request(app.getHttpServer())
        .post('/quiz')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })

    it('should create Quiz', () => {
      expect(token).not.toBeNull()

      return request(app.getHttpServer())
        .post('/quiz')
        .set('Authorization', `Bearer ${token}`)
        .send(quizDto)
        .expect(201)
    })
  })

  describe('/quiz/:id (DELETE)', () => {
    it('should not delete a Quiz without being authenticated', () => {
      return request(app.getHttpServer()).post('/quiz').expect(401).expect({
        statusCode: 401,
        message: 'Unauthorized',
      })
    })

    it('should not delete a Quiz when id is invalid', () => {
      expect(token).not.toBeNull()

      return request(app.getHttpServer())
        .delete('/quiz/test')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })

    it("should not delete a Quiz that doesn't exist", () => {
      expect(token).not.toBeNull()

      return request(app.getHttpServer())
        .delete(`/quiz/${quizDto.createdBy}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Quiz not found',
          error: 'Not Found',
        })
    })

    it('should delete Quiz', async () => {
      const [quiz] = await service.findAllByUser(quizDto.createdBy)
      expect(quiz).not.toBeNull()

      token = jwtService.sign({ id: quizDto.createdBy })

      return request(app.getHttpServer())
        .delete(`/quiz/${quiz._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({ message: 'Quiz deleted successfully' })
    })
  })
})
