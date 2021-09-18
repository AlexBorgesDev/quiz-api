import { Schema } from 'mongoose'

import { Quiz } from '../quiz/quiz.interface'
import { User } from '../user/user.interface'

export interface Collection {
  name: string
  quizzes: Quiz[] | Schema.Types.ObjectId[] | string[]
  isPublic?: boolean
  createdBy: User | Schema.Types.ObjectId | string
}
