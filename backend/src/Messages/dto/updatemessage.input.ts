import { InputType, Field, PartialType, Int } from '@nestjs/graphql';
import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { AddMessageInput } from './addmessage.input';

@InputType()
export class UpdateMessageInput extends PartialType(AddMessageInput) {
    @Field(() => Int)
    index: number;
}