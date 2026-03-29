import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { RolesService } from '../../services/roles/roles.service';
import { RolesType } from '../../dto/roles/roles.type';
import { CreateRolesInput } from '../../dto/roles/create-roles.input';
import { UpdateRolesInput } from '../../dto/roles/update-roles.input';

@Resolver(() => RolesType)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Query(() => [RolesType], { name: 'roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Query(() => RolesType, { name: 'role' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.rolesService.findOne(id);
  }

  @Mutation(() => RolesType, { name: 'createRole' })
  create(@Args('input') input: CreateRolesInput) {
    return this.rolesService.create(input as any);
  }

  @Mutation(() => RolesType, { name: 'updateRole' })
  update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateRolesInput) {
    return this.rolesService.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'removeRole' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res: any = await this.rolesService.remove(id);
    return (res?.affected ?? 0) > 0;
  }
}

