import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Post,
  Request,
} from '@nestjs/common'

import { Public } from '../public.decorator'
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

    await this.service.create(user)

    return { message: 'User created successfully' }
  }

  @Delete()
  async delete(@Request() req: any) {
    const result = await this.service.delete(req.user.id)

    if (result.deletedCount === 0) throw new NotFoundException('User not found')

    return { message: 'User deleted successfully' }
  }
}
