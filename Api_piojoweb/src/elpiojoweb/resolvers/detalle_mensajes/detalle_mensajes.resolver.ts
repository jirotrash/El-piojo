import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DetalleMensajesService } from '../../services/detalle_mensajes/detalle_mensajes.service';
import { DetalleMensajesType } from '../../dto/detalle_mensajes/detalle_mensajes.type';
import { CreateDetalleMensajesInput } from '../../dto/detalle_mensajes/create-detalle_mensajes.input';

@Resolver(() => DetalleMensajesType)
export class DetalleMensajesResolver {
  constructor(private readonly detalleMensajesService: DetalleMensajesService) {}

  @Mutation(() => DetalleMensajesType, { name: 'createDetalleMensaje' })
  createDetalleMensaje(
    @Args('createDetalleMensajesInput') createDetalleMensajesInput: CreateDetalleMensajesInput,
  ) {
    return this.detalleMensajesService.create(createDetalleMensajesInput);
  }

  @Query(() => [DetalleMensajesType], { name: 'detalleMensajes' })
  findAll() {
    return this.detalleMensajesService.findAll();
  }

  @Query(() => DetalleMensajesType, { name: 'detalleMensaje' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.detalleMensajesService.findOne(id);
  }
}

