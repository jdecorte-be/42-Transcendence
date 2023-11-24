import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  isString,
  IsString,
  MaxLength,
  MinLength,
  NotContains,
} from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export class LeadeBoardDto {
  login: string;
  victories: number;
  rank: number;
  avatar: Uint8Array;
}

export class UserIdDto {
  @IsNumber()
  id: number;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;
}

export class FirstLogDto {
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsString()
  id: string;
}

export class ProfileDto {
  login: string;
  avatar: Uint8Array;
  status: string;
}

export class UserResponseDto {
  id: number;
  login: string;
  status: string;
  has2fa: boolean;
  phoneNumber: string;
}

export class SignDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(15)
  @NotContains(' ')
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(15)
  @NotContains(' ')
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  @NotContains(' ')
  phoneNumber: string;
}

export class loginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(15)
  @NotContains(' ')
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(15)
  @NotContains(' ')
  password: string;
}

export class codeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  code: string;
}

export class imgDto {
  file: File;

  @IsString()
  filename: string;

  @IsString()
  type: string;
}

@ObjectType()
export class MatchHistoryDto {
  @Field()
  @IsString()
  Winner: string;

  @Field()
  @IsString()
  Loser: string;

  @Field()
  @IsInt()
  scoreX: number;

  @Field()
  @IsInt()
  scoreY: number;

  @Field()
  @IsDate()
  date: Date;
}

export class MatchResultDto {
  @IsInt()
  id: number;

  @IsString()
  Player1: string;

  @IsString()
  Player2: string;

  @IsInt()
  scoreX: number;

  @IsInt()
  scoreY: number;
}

@InputType()
export class UserRelationDto {
  @Field()
  @IsInt()
  id: number;

  @Field()
  @IsString()
  target: string;
}

export class FriendDto {
  id: number;
  login: string;
  avatar: string;
  status: string;
}

export class UpdateProfileDto {
  @IsInt()
  id: number;

  @IsString()
  login?: string;
}
