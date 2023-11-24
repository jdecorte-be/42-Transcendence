import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";


@Entity()
@ObjectType()
export class BanItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {})
  index: number;

  @Field()
  @Column({ type: 'uuid', nullable: true})
  chatUUID: string;

  @Column({ type: 'varchar', nullable: true})
  @Field({ description: 'The login of the user who was banned' })
  login: string;

  @Field(() => Date, { defaultValue: new Date(), description: 'The date and time when the ban expires' })
  @CreateDateColumn()
  bannedUntil: Date;
}