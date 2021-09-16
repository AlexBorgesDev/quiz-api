import * as Joi from 'joi'

export const validationTestSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  MONGO_URL_TEST: Joi.string().required(),
})
