import { Error } from 'mongoose'
import { compareSync } from 'bcryptjs'
import { internet, name } from 'faker'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { UserSchema } from './user.schema'
import { UserService } from './user.service'
import { validationTestSchema as validationSchema } from '../config/validation-test'

describe('UserService', () => {
  let service: UserService

  const userDto = {
    name: name.findName(),
    email: internet.email(),
    password: internet.password(10),
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
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [UserService],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  describe('#create', () => {
    it('should not create User with falsy params', async () => {
      expect.assertions(5)
      try {
        await service.create(null)
      } catch (error) {
        error = error as Error
        expect(error.name).toEqual('ValidationError')
        expect(error.errors).not.toBeNull()
        expect(error.errors.name).not.toBeNull()
        expect(error.errors.email).not.toBeNull()
        expect(error.errors.password).not.toBeNull()
      }
    })

    it('should create User', async () => {
      const user = await service.create(userDto)
      expect(user).not.toBeUndefined()
    })

    it('should crypt User password', async () => {
      const user = await service.findByEmail(userDto.email)
      expect(user).not.toBeNull()
      expect(compareSync(userDto.password, user.password)).toBe(true)
    })
  })

  it('should find User by email', async () => {
    const user = await service.findByEmail(userDto.email)
    expect(user).not.toBeNull()
    expect(user.email).toBe(user.email)
  })

  it('should find User by id', async () => {
    const user = await service.findByEmail(userDto.email)
    expect(user).not.toBeNull()

    const res = await service.findById(user._id)
    expect(res).not.toBeNull()
    expect(res.email).toBe(user.email)
  })

  it('should delete User', async () => {
    const user = await service.findByEmail(userDto.email)
    expect(user).not.toBeNull()
    const res = await service.delete(user.id)
    expect(res.deletedCount).toBe(1)
  })
})
