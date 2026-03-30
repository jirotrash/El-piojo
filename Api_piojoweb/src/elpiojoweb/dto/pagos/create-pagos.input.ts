import { InputType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';

export enum MetodoPagoEnum {
	EFECTIVO = 'EFECTIVO',
	TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum EstadoPagoEnum {
	PENDIENTE = 'PENDIENTE',
	COMPLETADO = 'COMPLETADO',
	RECHAZADO = 'RECHAZADO',
}

registerEnumType(MetodoPagoEnum, { name: 'MetodoPagoEnum' });
registerEnumType(EstadoPagoEnum, { name: 'EstadoPagoEnum' });

@InputType()
export class CreatePagosInput {
	@Field(() => Int)
	@IsInt()
	id_usuarios_pagador: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	id_historial_cupones?: number;

	@Field(() => Float)
	@IsNumber()
	total: number;

	@Field(() => Float)
	@IsNumber()
	total_con_descuento: number;

	@Field(() => MetodoPagoEnum)
	@IsEnum(MetodoPagoEnum)
	metodo_pago: MetodoPagoEnum;

	@Field(() => EstadoPagoEnum, { nullable: true })
	@IsOptional()
	@IsEnum(EstadoPagoEnum)
	estado?: EstadoPagoEnum;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	url_comprobante?: string;
}

