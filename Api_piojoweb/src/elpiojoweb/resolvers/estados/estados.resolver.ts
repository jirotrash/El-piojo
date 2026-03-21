import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { EstadosService } from '../../services/estados/estados.service';
import { EstadosType } from '../../dto/estados/estados.type';
import { CreateEstadosInput } from '../../dto/estados/create-estados.input';
import { UpdateEstadosInput } from '../../dto/estados/update-estados.input';

@Resolver(() => EstadosType)
export class EstadosResolver {
	constructor(private readonly estadosService: EstadosService) {}

	@Query(() => [EstadosType], { name: 'estados' })
	findAll() {
		return this.estadosService.findAll();
	}

	@Query(() => EstadosType, { name: 'estado' })
	findOne(@Args('id', { type: () => Int }) id: number) {
		return this.estadosService.findOne(id);
	}

	@Mutation(() => EstadosType, { name: 'createEstado' })
	create(@Args('input') input: CreateEstadosInput) {
		return this.estadosService.create(input as any);
	}

	@Mutation(() => EstadosType, { name: 'updateEstado' })
	update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateEstadosInput) {
		return this.estadosService.update(id, input as any);
	}

	@Mutation(() => Boolean, { name: 'removeEstado' })
	async remove(@Args('id', { type: () => Int }) id: number) {
		const res = await this.estadosService.remove(id as any);
		return (res && (res as any).affected ? true : false);
	}
}
