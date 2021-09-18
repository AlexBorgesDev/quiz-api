import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { Schema } from 'mongoose'

export class CreateCollectionDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  quizzes: string[] | Schema.Types.ObjectId[]

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean
}

export class DeleteCollectionDto {
  @IsMongoId()
  id: string | Schema.Types.ObjectId
}
