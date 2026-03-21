import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePuntosEntregaInput } from './create-puntos_entrega.input';

@InputType()
export class UpdatePuntosEntregaInput extends PartialType(CreatePuntosEntregaInput) {}

