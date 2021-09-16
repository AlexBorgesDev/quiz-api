import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserSchema } from '../user/user.schema'
import { UserModule } from '../user/user.module'
import { QuizSchema } from './quiz.schema'
import { QuizService } from './quiz.service'
import { QuizController } from './quiz.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Quiz', schema: QuizSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UserModule,
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizModule {}
