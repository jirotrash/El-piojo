import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PagosService } from '../../services/pagos/pagos.service';
import { PagosType } from '../../dto/pagos/pagos.type';
import { CreatePagosInput } from '../../dto/pagos/create-pagos.input';

@Resolver(() => PagosType)
export class PagosResolver {
  constructor(private readonly pagosService: PagosService) {}

  @Query(() => [PagosType], { name: 'pagos' })
  findAll() {
    return this.pagosService.findAll();
  }

  @Query(() => PagosType, { name: 'pago' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.pagosService.findOne(id);
  }

  @Mutation(() => PagosType, { name: 'createPago' })
  createPago(@Args('createPagosInput') createPagosInput: CreatePagosInput) {
    return this.pagosService.create(createPagosInput);
  }
}

