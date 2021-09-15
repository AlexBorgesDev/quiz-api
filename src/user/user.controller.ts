import { BadRequestException, Body, Controller, Post } from '@nestjs/common'

import { UserService } from './user.service'
import { CreateUserDto } from './user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    const userAlreadyExists = await this.service.findByEmail(user.email)

    if (userAlreadyExists) throw new BadRequestException('User already exists')

    await this.service.create(user)

    return { message: 'User created successfully' }
  }
}
