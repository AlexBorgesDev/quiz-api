import { Schema } from 'mongoose'

import { User } from '../user/user.interface'

export interface Quiz {
  question: string
  alternatives: string[]
  correctAlternative: number
  createdBy: string | Schema.Types.ObjectId | User
}
