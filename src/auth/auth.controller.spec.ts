import { internet } from 'faker'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'
import { JwtStrategy } from './jwt.strategy'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { validationTestSchema as validationSchema } from '../config/validation-test'

describe('AuthController', () => {
  let controller: AuthController
  let userService: UserService

  const userDto = { email: internet.email(), password: internet.password(10) }

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
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    userService = module.get<UserService>(UserService)
  })

  afterAll(async () => {
    const user = await userService.findByEmail(userDto.email)
    await userService.delete(user.id)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#login', () => {
    beforeAll(async () => {
      await userService.create({ ...userDto, name: 'Auth Test' })
    })

    it('should not authenticate if credentials are invalid', async () => {
      expect.assertions(3)
      try {
        await controller.login({ ...userDto, password: '12345678' })
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should return access_token when credentials are valid', async () => {
      const res = await controller.login(userDto)
      expect(res).not.toBeNull()
      expect(res.access_token).not.toBeNull()
    })
  })
})
