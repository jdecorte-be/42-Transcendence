import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { UserRelationDto } from "./users.dto";



@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    ) {}

    @Query(() => [User], { name: 'user' })
    displayAll() {
      return this.usersService.displayAll();
    }

    @Query(() => User, { name: 'getByLogin' })
    getByLogin(@Args('userID', { type: () => String }) userID: string) {
      return this.usersService.getByLogin(userID);
    }

    @Mutation(() => User, { name: 'addFriend' })
    addFriend(@Args('userRelationDto') userRelationDto: UserRelationDto) {
      this.addFriend(userRelationDto);
      return this.usersService.getByLogin(userRelationDto.target);
    }

    @Mutation(() => User, { name: 'addFriend' })
    removeFriend(@Args('userRelationDto') userRelationDto: UserRelationDto) {
      this.removeFriend(userRelationDto)
      return this.usersService.getByLogin(userRelationDto.target);
    }

    @Mutation(() => User, { name: 'blockUser' })
    blockUser(
      @Args('from', { type: () => String }) from: string,
      @Args('userID', { type: () => String }) userID: string,
      ) {
      this.usersService.blockByLogin(from, userID)
      return this.usersService.getByLogin(from);
    }
}
