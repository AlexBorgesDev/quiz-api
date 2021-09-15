import { Body, Controller, Post } from '@nestjs/common'

import { Public } from '../public.decorator'
import { AuthService } from './auth.service'
import { AuthLoginDto } from './auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.service.login(authLoginDto)
  }
}
