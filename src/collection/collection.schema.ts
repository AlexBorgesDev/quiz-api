import { Schema } from 'mongoose'

import { Collection } from './collection.interface'

export const CollectionSchema = new Schema<Collection>({
  name: { type: String, required: true },
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz', required: true }],
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  isPublic: { type: Boolean, required: true, default: false },
})
