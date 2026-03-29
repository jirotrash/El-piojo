import { InputType, PartialType } from '@nestjs/graphql';
import { CreateDetallePublicacionesInput } from './create-detalle_publicaciones.input';

@InputType()
export class UpdateDetallePublicacionesInput extends PartialType(CreateDetallePublicacionesInput) {}

