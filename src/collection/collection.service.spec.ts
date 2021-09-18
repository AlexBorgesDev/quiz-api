import { Error, Types } from 'mongoose'
import { internet, name } from 'faker'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { validationSchema } from '../config/validation'
import { CollectionSchema } from './collection.schema'
import { CollectionService } from './collection.service'
import { QuizSchema } from '../quiz/quiz.schema'
import { UserModule } from '../user/user.module'
import { UserSchema } from '../user/user.schema'
import { UserService } from '../user/user.service'

describe('CollectionService', () => {
  let service: CollectionService
  let userService: UserService

  const userDto = {
    name: name.findName(),
    email: internet.email(),
    password: internet.password(10),
  }

  const collectionDto = {
    name: 'Collection Test',
    quizzes: [new Types.ObjectId().toString()],
    createdBy: new Types.ObjectId().toString(),
    isPublic: false,
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
          { name: 'Collection', schema: CollectionSchema },
          { name: 'Quiz', schema: QuizSchema },
          { name: 'User', schema: UserSchema },
        ]),
        UserModule,
      ],
      providers: [CollectionService],
    }).compile()

    service = module.get<CollectionService>(CollectionService)
    userService = module.get<UserService>(UserService)
  })

  afterAll(async () => {
    await userService.delete(collectionDto.createdBy)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#create', () => {
    it('should not create a Collection if the User does not exist', async () => {
      expect.assertions(3)
      try {
        await service.create(collectionDto)
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should not create Collection with falsy params', async () => {
      expect.assertions(4)

      const userId = await userService.create(userDto)
      expect(userId).not.toBeNull()

      collectionDto.createdBy = userId.toString()

      try {
        await service.create({ createdBy: userId } as any)
      } catch (error) {
        error = error as Error
        expect(error.name).toEqual('ValidationError')
        expect(error.errors).not.toBeNull()
        expect(error.errors.name).not.toBeNull()
      }
    })

    it('should create Collection', async () => {
      const collection = await service.create(collectionDto)
      expect(collection).not.toBeNull()
      expect(collection._id).not.toBeNull()
      expect(collection.name).toEqual(collectionDto.name)
    })
  })

  describe('#delete', () => {
    it("should not delete a collection that doesn't exist", async () => {
      const result = await service.delete(
        new Types.ObjectId().toString(),
        collectionDto.createdBy,
      )

      expect(result).not.toBeNull()
      expect(result.deletedCount).toBe(0)
    })

    it('should delete Collection', async () => {
      const [collection] = await service.findByUserId(collectionDto.createdBy)
      expect(collection).not.toBeNull()

      const res = await service.delete(collection._id, collectionDto.createdBy)
      expect(res).not.toBeNull()
      expect(res.deletedCount).toBe(1)
    })
  })
})
