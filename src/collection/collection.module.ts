import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CollectionSchema } from './collection.schema'
import { CollectionService } from './collection.service'
import { CollectionController } from './collection.controller'
import { QuizSchema } from '../quiz/quiz.schema'
import { UserSchema } from '../user/user.schema'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Collection', schema: CollectionSchema },
      { name: 'Quiz', schema: QuizSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UserModule,
  ],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}
