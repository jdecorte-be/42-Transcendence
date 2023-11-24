import { AddChatInput } from './addchat.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateChatInput extends PartialType(AddChatInput) {
  @Field()
  uuid: string;

  @Field({ nullable: true })
  isAlive: boolean;

  @Field(() => [String], { nullable: true })
  adminID: string[];

  @Field(() => [String], { nullable: true })
  userID: string[];

  @Field(() => [String], { nullable: true })
  muteID: string[];
}