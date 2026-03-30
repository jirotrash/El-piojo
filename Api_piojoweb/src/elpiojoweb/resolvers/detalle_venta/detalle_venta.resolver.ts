import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DetalleVentaService } from '../../services/detalle_venta/detalle_venta.service';
import { DetalleVentaType } from '../../dto/detalle_venta/detalle_venta.type';
import { CreateDetalleVentaInput } from '../../dto/detalle_venta/create-detalle_venta.input';

@Resolver(() => DetalleVentaType)
export class DetalleVentaResolver {
  constructor(private readonly detalleVentaService: DetalleVentaService) {}

  @Query(() => [DetalleVentaType], { name: 'detalleVenta' })
  findAll() {
    return this.detalleVentaService.findAll();
  }

  @Query(() => DetalleVentaType, { name: 'detalleVentaById' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.detalleVentaService.findOne(id);
  }

  @Mutation(() => DetalleVentaType, { name: 'createDetalleVenta' })
  createDetalleVenta(@Args('createDetalleVentaInput') createDetalleVentaInput: CreateDetalleVentaInput) {
    return this.detalleVentaService.create(createDetalleVentaInput);
  }
}

