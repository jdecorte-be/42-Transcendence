
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Generated,
  BeforeInsert,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BanItem } from './ban.entity';

enum ChatMutationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

registerEnumType(ChatMutationType, {
  name: 'ChatMutationType',
  description: 'The type of chat mutation',
});


export type ChatType = 'public' | 'private' | 'dm';

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  index: number;

  @Generated('uuid')
  @Column({ type: 'uuid' })
  @Field()
  uuid: string;

  @Field()
  @Column('varchar', { length: 15 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Field()
  @Column({ type: 'boolean', default: true })
  isAlive: boolean;

  @Field()
  @Column({
    type: 'enum',
    enum: ['public', 'private', 'dm'],
    default: 'public',
  })
  type: ChatType;

  @Field()
  @Column('varchar')
  ownerID: string;

  @Field(() => [String])
  @Column({ type: 'varchar', array: true, nullable: true, default: {} })
  adminID: string[];

  @Field(() => [String])
  @Column({ type: 'varchar', array: true, nullable: true, default: {} })
  userID: string[];

  @Field(() => [String])
  @Column({ type: 'varchar', array: true, nullable: true, default: {} })
  muteID: string[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  modifiedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (!this.password) return;
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}