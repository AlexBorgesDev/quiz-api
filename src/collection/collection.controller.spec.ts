import { Types } from 'mongoose'
import { internet, name } from 'faker'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { QuizSchema } from '../quiz/quiz.schema'
import { UserModule } from '../user/user.module'
import { UserSchema } from '../user/user.schema'
import { UserService } from '../user/user.service'
import { validationSchema } from '../config/validation'
import { CollectionSchema } from './collection.schema'
import { CollectionService } from './collection.service'
import { CollectionController } from './collection.controller'
import { UnauthorizedException } from '@nestjs/common'

describe('CollectionController', () => {
  let controller: CollectionController
  let userService: UserService

  let collectionId: string

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
      controllers: [CollectionController],
      providers: [CollectionService],
    }).compile()

    controller = module.get<CollectionController>(CollectionController)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#delete', () => {
    it('should not create a Collection if the User does not exist', async () => {
      expect.assertions(3)
      try {
        await controller.create(collectionDto, {
          user: { id: collectionDto.createdBy },
        })
      } catch (error) {
        error = error as UnauthorizedException
        expect(error.name).toEqual('UnauthorizedException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(401)
      }
    })

    it('should create Collection', async () => {
      const userId = await userService.create(userDto)
      expect(userId).not.toBeNull()
      collectionDto.createdBy = userId.toString()

      const collection = await controller.create(collectionDto, {
        user: { id: userId },
      })

      expect(collection).not.toBeNull()
      expect(collection.message).toEqual('Collection created successfully')
      expect(collection.collection._id).not.toBeNull()
      collectionId = collection.collection._id
      expect(collection.collection.name).toEqual(collectionDto.name)
    })
  })

  it('should delete Collection', async () => {
    expect(collectionId).not.toBeNull()

    const res = await controller.delete(
      { id: collectionId },
      { user: { id: collectionDto.createdBy } },
    )

    expect(res).not.toBeNull()
    expect(res.message).toEqual('Collection deleted successfully')
  })
})
