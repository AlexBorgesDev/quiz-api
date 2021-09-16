import { Schema } from 'mongoose'

import { Quiz } from './quiz.interface'

export const QuizSchema = new Schema<Quiz>({
  question: { type: String, required: true },
  alternatives: [{ type: String, required: true }],
  correctAlternative: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
})
