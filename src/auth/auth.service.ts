import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compareSync } from 'bcryptjs'

import { UserService } from '../user/user.service'
import { AuthLoginDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: AuthLoginDto) {
    const user = await this.userService.findByEmail(email)

    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException('The email or password is invalid')
    }

    return user
  }

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto)
    const payload = { userId: user.id }

    return { access_token: this.jwtService.sign(payload) }
  }
}
