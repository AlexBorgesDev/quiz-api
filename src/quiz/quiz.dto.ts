import { Schema } from 'mongoose'

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateQuizDto {
  @IsString()
  @MinLength(4)
  question: string

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  alternatives: string[]

  @IsInt()
  @IsPositive()
  correctAlternative: number
}

export class DeleteQuizDto {
  @IsMongoId()
  id: string | Schema.Types.ObjectId
}
