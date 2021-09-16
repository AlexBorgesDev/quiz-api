import { BadRequestException, NotFoundException } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { UserController } from './user.controller'
import { UserSchema } from './user.schema'
import { UserService } from './user.service'

describe('UserController', () => {
  let controller: UserController
  let userService: UserService
  const userDto = { name: 'Test', email: 'test@test.com', password: '12345678' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://0.0.0.0/quiz-test'),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile()

    controller = module.get<UserController>(UserController)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('#create', () => {
    it('should not create User with falsy params', async () => {
      expect.assertions(1)
      try {
        await controller.create(null)
      } catch (error) {
        expect(error.name).toEqual('TypeError')
      }
    })

    it('should create User', async () => {
      const user = await controller.create(userDto)
      expect(user).not.toBeNull()
    })

    it('should not create User with email already in use', async () => {
      expect.assertions(3)
      try {
        await controller.create(userDto)
      } catch (error) {
        error = error as BadRequestException
        expect(error.name).toEqual('BadRequestException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(400)
      }
    })
  })

  describe('#delete', () => {
    it('should delete User', async () => {
      const user = await userService.findByEmail(userDto.email)
      expect(user).not.toBeNull()

      const res = await controller.delete({ user: { id: user.id } })
      expect(res).not.toBeNull()
      expect(res.message).toEqual('User deleted successfully')
    })

    it("should not delete a user that doesn't exist", async () => {
      expect.assertions(4)

      const id = new Types.ObjectId().toString()
      expect(id).not.toBeNull()

      try {
        await controller.delete({ user: { id } })
      } catch (error) {
        error = error as NotFoundException
        expect(error.name).toEqual('NotFoundException')
        expect(error.response).not.toBeNull()
        expect(error.response.statusCode).toBe(404)
      }
    })
  })
})
