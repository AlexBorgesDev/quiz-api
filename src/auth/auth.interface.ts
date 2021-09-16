import { Schema } from 'mongoose'

export interface Payload {
  id: string | Schema.Types.ObjectId
}
