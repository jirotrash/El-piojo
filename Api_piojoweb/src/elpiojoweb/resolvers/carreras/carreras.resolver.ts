import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { CarrerasService } from '../../services/carreras/carreras.service';
import { CarrerasType } from '../../dto/carreras/carreras.type';
import { CreateCarreraInput } from '../../dto/carrera/create-carrera.input';
import { UpdateCarreraInput } from '../../dto/carrera/update-carrera.inputs';

@Resolver(() => CarrerasType)
export class CarrerasResolver {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Query(() => [CarrerasType], { name: 'carreras' })
  findAll() {
    return this.carrerasService.findAll();
  }

  @Query(() => CarrerasType, { name: 'carrera' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.carrerasService.findOne(id);
  }

  @Mutation(() => CarrerasType, { name: 'createCarrera' })
  create(@Args('input') input: CreateCarreraInput) {
    return this.carrerasService.create(input as any);
  }

  @Mutation(() => CarrerasType, { name: 'updateCarrera' })
  update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateCarreraInput) {
    return this.carrerasService.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'removeCarrera' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res = await this.carrerasService.remove(id as any);
    return (res && (res as any).affected ? true : false);
  }
}

