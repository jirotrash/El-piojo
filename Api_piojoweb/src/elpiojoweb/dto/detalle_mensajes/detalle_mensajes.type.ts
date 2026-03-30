import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UsuariosType } from '../usuarios/usuarios.type';
import { ConversacionesType } from '../conversaciones/conversaciones.type';

@ObjectType()
export class DetalleMensajesType {
  @Field(() => Int)
  id_detalle_mensajes: number;

  @Field(() => ConversacionesType, { nullable: true })
  conversacion?: ConversacionesType;

  @Field(() => UsuariosType, { nullable: true })
  emisor?: UsuariosType;

  @Field()
  mensaje: string;

  @Field()
  fecha_envio: string;
}
