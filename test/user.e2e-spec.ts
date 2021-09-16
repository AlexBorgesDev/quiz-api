import * as request from 'supertest'

import { internet, name } from 'faker'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { UserService } from '../src/user/user.service'

import { AppModule } from '../src/app.module'
import { validationTestSchema } from '../src/config/validation-test'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let service: UserService
  let jwtService: JwtService

  const userDto = {
    name: name.findName(),
    email: internet.email(),
    password: internet.password(10),
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

    jwtService = moduleFixture.get<JwtService>(JwtService)
    service = moduleFixture.get<UserService>(UserService)
    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('/user (POST)', () => {
    it('should create User', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send(userDto)
        .expect(201)
        .expect({ message: 'User created successfully' })
    })

    it('should not create User with email already in use', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send(userDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'User already exists',
          error: 'Bad Request',
        })
    })
  })

  describe('/user (DELETE)', () => {
    it('should not delete the user when the token is invalid', () => {
      return request(app.getHttpServer())
        .delete('/user')
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' })
    })

    it('should delete User', async () => {
      const user = await service.findByEmail(userDto.email)
      expect(user).not.toBeNull()

      const token = jwtService.sign({ id: user.id })
      expect(token).not.toBeNull()

      return request(app.getHttpServer())
        .delete('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({ message: 'User deleted successfully' })
    })
  })
})
