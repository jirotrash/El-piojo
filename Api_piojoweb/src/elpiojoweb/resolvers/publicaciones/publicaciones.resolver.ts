import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PublicacionesService } from '../../services/publicaciones/publicaciones.service';
import { PublicacionesType } from '../../dto/publicaciones/publicaciones.type';
import { CreatePublicacionesInput } from '../../dto/publicaciones/create-publicaciones.input';
import { UpdatePublicacionesInput } from '../../dto/publicaciones/update-publicaciones.input';
import { DetallePublicacionesService } from '../../services/detalle_publicaciones/detalle_publicaciones.service';
import { CreateDetallePublicacionesInput } from '../../dto/detalle_publicaciones/create-detalle_publicaciones.input';

@Resolver(() => PublicacionesType)
export class PublicacionesResolver {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly detallePublicacionesService: DetallePublicacionesService,
  ) {}

  @Query(() => [PublicacionesType], { name: 'publicaciones' })
  async findAll() {
    const rows = await this.publicacionesService.findAll();
    // Map relations to scalar FK fields so GraphQL returns id_usuarios / id_puntos_entrega
    return (rows || []).map((r: any) => ({
      ...r,
      id_usuarios: r.usuario ? (r.usuario.id_usuarios ?? r.usuario.id) : undefined,
      id_puntos_entrega: r.punto_entrega ? (r.punto_entrega.id_puntos_entrega ?? r.punto_entrega.id) : undefined,
      detallePublicaciones: (r.fotos || []).map((f: any) => ({ url_foto: f.url_foto, es_portada: !!f.es_portada })),
    }));
  }

  @Query(() => PublicacionesType, { name: 'publicacion' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.publicacionesService.findOne(id).then((r: any) => r ? ({
      ...r,
      id_usuarios: r.usuario ? (r.usuario.id_usuarios ?? r.usuario.id) : undefined,
      id_puntos_entrega: r.punto_entrega ? (r.punto_entrega.id_puntos_entrega ?? r.punto_entrega.id) : undefined,
      detallePublicaciones: (r.fotos || []).map((f: any) => ({ url_foto: f.url_foto, es_portada: !!f.es_portada })),
    }) : null);
  }

  @Mutation(() => PublicacionesType, { name: 'createPublicacion' })
  async create(@Args('input') input: CreatePublicacionesInput) {
    // Ensure default values server-side: marca debe guardarse como 'Generica' si viene vacía
    try {
      const maybeMarca = (input as any).marca;
      if (!maybeMarca || String(maybeMarca).trim() === '') {
        (input as any).marca = 'Generica';
      }
    } catch (e) {
      // ignore and proceed
    }

    // Normalize precio: if cliente envía null (donación) o undefined, set a valor por defecto (0)
    try {
      const maybePrecio = (input as any).precio;
      if (maybePrecio === null || typeof maybePrecio === 'undefined') {
        (input as any).precio = 0;
      }
    } catch (e) {
      // ignore
    }

    // create main publication
    // Map incoming FK scalar ids to relation objects so TypeORM saves foreign keys
    try {
      const inObj: any = input as any;
      if (typeof inObj.id_usuarios !== 'undefined' && inObj.id_usuarios !== null) {
        inObj.usuario = { id_usuarios: Number(inObj.id_usuarios) };
        delete inObj.id_usuarios;
      }
      if (typeof inObj.id_puntos_entrega !== 'undefined' && inObj.id_puntos_entrega !== null) {
        inObj.punto_entrega = { id_puntos_entrega: Number(inObj.id_puntos_entrega) };
        delete inObj.id_puntos_entrega;
      }
    } catch (e) {
      // ignore mapping errors
    }

    const created = await this.publicacionesService.create(input as any);

    // if detallePublicaciones provided, create each detalle row linking to created id
    const detalles: CreateDetallePublicacionesInput[] = (input as any).detallePublicaciones ?? [];
    for (const d of detalles) {
      const dto: any = { ...d };
      // map scalar id to relation object so TypeORM saves FK
      dto.publicacion = { id_publicaciones: (created as any).id_publicaciones };
      if (typeof dto.id_publicaciones !== 'undefined') delete dto.id_publicaciones;
      // Use detallePublicaciones service to create
      await this.detallePublicacionesService.create(dto as any);
    }

    return created;
  }

  // Admin: backfill orphan detalle_publicaciones into publicaciones.
  // Dry run returns suggested assignments without applying.
  @Mutation(() => String, { name: 'backfillOrphanDetalles' })
  async backfillOrphanDetalles(@Args('dryRun', { type: () => Boolean, nullable: true }) dryRun = true) {
    // load publications without fotos
    const pubs = await this.publicacionesService.findAll();
    // Filter those having zero fotos
    const pubsNoFotos = pubs.filter((p: any) => !(p.fotos && p.fotos.length > 0));
    const orphans = await this.detallePublicacionesService.findOrphans();

    if (pubsNoFotos.length === 0 || orphans.length === 0) {
      return 'No hay publicaciones sin fotos o no hay fotos huérfanas.';
    }

    const assignments: Array<{ publicacionId: number; detalleId: number; url: string } > = [];
    let orphanIdx = 0;
    for (const p of pubsNoFotos) {
      if (orphanIdx >= orphans.length) break;
      // prefer an orphan marked as portada
      let chosenIdx = orphans.slice(orphanIdx).findIndex(o => !!o.es_portada);
      if (chosenIdx === -1) chosenIdx = 0;
      const chosen = orphans[orphanIdx + chosenIdx];
      assignments.push({ publicacionId: p.id_publicaciones, detalleId: chosen.id_detalle_publicaciones, url: chosen.url_foto });
      // remove assigned orphan by advancing orphanIdx
      orphans.splice(orphanIdx + chosenIdx, 1);
    }

    if (dryRun) {
      return JSON.stringify(assignments, null, 2);
    }

    // apply assignments
    for (const a of assignments) {
      await this.detallePublicacionesService.assignToPublication(a.detalleId, a.publicacionId);
    }

    return `Asignadas ${assignments.length} fotos huérfanas a publicaciones.`;
  }

  @Mutation(() => PublicacionesType, { name: 'updatePublicacion' })
  async update(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePublicacionesInput,
  ) {
    await this.publicacionesService.update(id, input as any);
    return this.publicacionesService.findOne(id).then((r: any) => r ? ({
      ...r,
      id_usuarios: r.usuario ? (r.usuario.id_usuarios ?? r.usuario.id) : undefined,
      id_puntos_entrega: r.punto_entrega ? (r.punto_entrega.id_puntos_entrega ?? r.punto_entrega.id) : undefined,
      detallePublicaciones: (r.fotos || []).map((f: any) => ({ url_foto: f.url_foto, es_portada: !!f.es_portada })),
    }) : null);
  }

  @Mutation(() => Boolean, { name: 'removePublicacion' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res = await this.publicacionesService.remove(id as any);
    return (res && (res as any).affected ? true : false);
  }
}

