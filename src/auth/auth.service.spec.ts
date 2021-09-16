import { internet } from 'faker'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'
import { JwtStrategy } from './jwt.strategy'
import { validationTestSchema as validationSchema } from '../config/validation-test'

describe('AuthService', () => {
  let service: AuthService
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
      providers: [AuthService, JwtStrategy],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
  })

  afterAll(async () => {
    const user = await userService.findByEmail(userDto.email)
    await userService.delete(user.id)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#validate-user', () => {
    beforeAll(async () => {
      await userService.create({ ...userDto, name: 'User Test' })
    })

    it('should not return the User if the password is invalid', async () => {
      expect.assertions(3)

      try {
        await service.validateUser({ ...userDto, password: '123456' })
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should return the User when the credentials are valid', async () => {
      const user = await service.validateUser(userDto)
      expect(user).not.toBeNull()
      expect(user.email).toBe(user.email)
    })
  })

  it('should return access_token when credentials are valid', async () => {
    const res = await service.login(userDto)
    expect(res).not.toBeNull()
    expect(res.access_token).not.toBeNull()
  })
})
