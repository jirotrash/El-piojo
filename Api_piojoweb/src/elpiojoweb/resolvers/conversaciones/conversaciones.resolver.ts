import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ConversacionesService } from '../../services/conversaciones/conversaciones.service';
import { ConversacionesType } from '../../dto/conversaciones/conversaciones.type';
import { CreateConversacionesInput } from '../../dto/conversaciones/create-conversaciones.input';

@Resolver(() => ConversacionesType)
export class ConversacionesResolver {
  constructor(private readonly conversacionesService: ConversacionesService) {}

  @Mutation(() => ConversacionesType, { name: 'createConversacion' })
  createConversacion(
    @Args('createConversacionesInput') createConversacionesInput: CreateConversacionesInput,
  ) {
    return this.conversacionesService.create(createConversacionesInput);
  }

  @Query(() => [ConversacionesType], { name: 'conversaciones' })
  findAll() {
    return this.conversacionesService.findAll();
  }

  @Query(() => ConversacionesType, { name: 'conversacion' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.conversacionesService.findOne(id);
  }
}

