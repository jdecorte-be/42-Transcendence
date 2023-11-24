import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { MatchHistoryDto } from './users.dto';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-minimal';
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  public id: number;

  @Field()
  @Column({ unique: true })
  public login: string;

  @Field()
  @Column({ unique: true, nullable: true })
  public pseudo: string;

  @Field()
  @Column({ nullable: true })
  private _password: string;

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  @Field()
  @Column({ default: false })
  is42: boolean;

  @Field()
  @Column({ default: false })
  has2fa: boolean;

  @Field()
  @Column({ nullable: true })
  code2fa: string;

  @Field()
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Field()
  @Column({ default: 'offline' })
  public status: string;

  @Field(() => [String])
  @Column('varchar', { array: true, nullable: true, default: {} })
  blackList: string[];

  @Field(() => [String])
  @Column('varchar', { array: true, nullable: true, default: {} })
  friendList: string[];

  @Field(() => [String])
  @Column('varchar', { array: true, nullable: true, default: {} })
  inviteList: string[];

  @Field(() => [MatchHistoryDto])
  @Column('jsonb', { nullable: true })
  matchHistory: MatchHistoryDto[];

  @Field()
  @Column({ default: 0 })
  nVictories: number;

  @Field()
  @Column({ default: 0 })
  nDefeats: number;

  @Field()
  @Column({ default: 'default.jpg' })
  filename: string;

  @Field(() => GraphQLUpload)
  @Column({
    type: 'bytea',
  })
  avatar: Uint8Array;
}
