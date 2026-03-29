import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { DetallePublicacionesService } from '../../services/detalle_publicaciones/detalle_publicaciones.service';
import { DetallePublicacionesType } from '../../dto/detalle_publicaciones/detalle_publicaciones.type';
import { CreateDetallePublicacionesInput } from '../../dto/detalle_publicaciones/create-detalle_publicaciones.input';
import { UpdateDetallePublicacionesInput } from '../../dto/detalle_publicaciones/update-detalle_publicaciones.input';

@Resolver(() => DetallePublicacionesType)
export class DetallePublicacionesResolver {
  constructor(private readonly detallePublicacionesService: DetallePublicacionesService) {}

  @Query(() => [DetallePublicacionesType], { name: 'detallePublicaciones' })
  async findAll() {
    const rows = await this.detallePublicacionesService.findAll();
    return (rows || []).map((r: any) => ({
      ...r,
      id_publicaciones: r.publicacion ? (r.publicacion.id_publicaciones ?? null) : null,
    }));
  }

  @Query(() => DetallePublicacionesType, { name: 'detallePublicacion' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    const r = await this.detallePublicacionesService.findOne(id);
    if (!r) return null;
    return { ...r, id_publicaciones: r.publicacion ? (r.publicacion.id_publicaciones ?? null) : null };
  }

  @Mutation(() => DetallePublicacionesType, { name: 'createDetallePublicacion' })
  create(@Args('input') input: CreateDetallePublicacionesInput) {
    return this.detallePublicacionesService.create(input as any);
  }

  @Mutation(() => DetallePublicacionesType, { name: 'updateDetallePublicacion' })
  update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateDetallePublicacionesInput) {
    return this.detallePublicacionesService.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'removeDetallePublicacion' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res = await this.detallePublicacionesService.remove(id as any);
    return (res && (res as any).affected ? true : false);
  }
}

