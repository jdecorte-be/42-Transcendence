import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPhoneNumber,
    isString,
    IsString,
    MaxLength,
    MinLength,
    NotContains,
    IsDate,
  } from 'class-validator';

  export class MatchHistoryDto {
    @IsString()
    Winner: string;
  
    @IsString()
    Loser: string;
  
    @IsInt()
    scoreX: number;
  
    @IsInt()
    scoreY: number;
  
    @IsDate()
    date: Date;
  }