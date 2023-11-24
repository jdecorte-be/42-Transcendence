import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

@InputType()
export class AddMessageInput {
    @Field()
    @IsNotEmpty()
    readonly chatUUID: string;
  
    @Field()
    @IsNotEmpty()
    readonly userID: string;
  
    @Field()
    @IsNotEmpty()
    readonly message: string;
}