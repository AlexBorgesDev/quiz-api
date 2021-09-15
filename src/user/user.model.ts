import * as mongoose from 'mongoose'

export const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
})

export interface User {
  id: string
  name: string
  email: string
  password: string
}
