/* eslint-disable prettier/prettier */
import { Field, ID, InputType } from '@nestjs/graphql';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCarreraInput } from './create-carrera.input';
import { IsNumber } from 'class-validator';

@InputType()
export class UpdateCarreraInput extends PartialType(CreateCarreraInput) {
@Field(() => ID)
@IsNumber()
id_carreras: number
}