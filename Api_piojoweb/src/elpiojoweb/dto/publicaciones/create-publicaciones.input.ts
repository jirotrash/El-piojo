import { InputType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { CreateDetallePublicacionesInput } from '../detalle_publicaciones/create-detalle_publicaciones.input';

export enum GeneroEnum {
	HOMBRE = 'HOMBRE',
	MUJER = 'MUJER',
	UNISEX = 'UNISEX',
	ACADEMICO = 'ACADEMICO',
}

export enum EstadoUsoEnum {
	NUEVO = 'NUEVO',
	BUENO = 'BUENO',
	USADO = 'USADO',
}

registerEnumType(GeneroEnum, { name: 'GeneroEnum' });
registerEnumType(EstadoUsoEnum, { name: 'EstadoUsoEnum' });

@InputType()
export class CreatePublicacionesInput {
	@Field(() => Int)
	@IsInt()
	id_usuarios: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	id_puntos_entrega?: number;

	@Field()
	@IsNotEmpty()
	@IsString()
	titulo: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	descripcion?: string;

	@Field()
	@IsNotEmpty()
	@IsString()
	categoria: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	talla?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	marca?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	color?: string;

	@Field(() => GeneroEnum)
	@IsEnum(GeneroEnum)
	genero: GeneroEnum;

	@Field(() => EstadoUsoEnum)
	@IsEnum(EstadoUsoEnum)
	estado_uso: EstadoUsoEnum;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	precio?: number;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	disponible?: boolean;

	@Field(() => [CreateDetallePublicacionesInput], { nullable: true })
	@IsOptional()
	detallePublicaciones?: CreateDetallePublicacionesInput[];
}

