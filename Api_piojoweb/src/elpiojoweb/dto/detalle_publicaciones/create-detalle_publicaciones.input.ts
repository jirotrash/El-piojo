import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class CreateDetallePublicacionesInput {
	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	id_publicaciones?: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	id_detalle_mensajes?: number;

	@Field()
	@IsNotEmpty()
	@IsString()
	url_foto: string;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	es_portada?: boolean;
}

