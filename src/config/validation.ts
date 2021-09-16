import * as Joi from 'joi'

export const validationSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  MONGO_URL: Joi.string().required(),
})
