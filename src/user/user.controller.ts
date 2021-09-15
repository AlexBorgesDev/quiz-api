import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { genSalt, hash } from 'bcryptjs'

import { Public } from 'src/public.decorator'
import { UserService } from './user.service'
import { CreateUserDto } from './user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Public()
  @Post()
  async create(@Body() user: CreateUserDto) {
    const userAlreadyExists = await this.service.findByEmail(user.email)

    if (userAlreadyExists) throw new BadRequestException('User already exists')

    const salt = await genSalt(10)
    const passwordHash = await hash(user.password, salt)

    await this.service.create({ ...user, password: passwordHash })

    return { message: 'User created successfully' }
  }
}
