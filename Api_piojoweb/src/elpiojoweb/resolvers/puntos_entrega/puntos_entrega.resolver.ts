import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PuntosEntregaService } from '../../services/puntos_entrega/puntos_entrega.service';
import { PuntosEntregaType } from '../../dto/puntos_entrega/puntos_entrega.type';
import { CreatePuntosEntregaInput } from '../../dto/puntos_entrega/create-puntos_entrega.input';
import { UpdatePuntosEntregaInput } from '../../dto/puntos_entrega/update-puntos_entrega.input';

@Resolver(() => PuntosEntregaType)
export class PuntosEntregaResolver {
  constructor(private readonly puntosEntregaService: PuntosEntregaService) {}

  @Query(() => [PuntosEntregaType], { name: 'puntosEntrega' })
  findAll() {
    return this.puntosEntregaService.findAll();
  }

  @Query(() => PuntosEntregaType, { name: 'puntoEntrega' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.puntosEntregaService.findOne(id);
  }

  @Mutation(() => PuntosEntregaType, { name: 'createPuntoEntrega' })
  create(@Args('input') input: CreatePuntosEntregaInput) {
    return this.puntosEntregaService.create(input as any);
  }

  @Mutation(() => PuntosEntregaType, { name: 'updatePuntoEntrega' })
  update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdatePuntosEntregaInput) {
    return this.puntosEntregaService.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'removePuntoEntrega' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res = await this.puntosEntregaService.remove(id as any);
    return (res && (res as any).affected ? true : false);
  }
}

