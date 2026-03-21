import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { MunicipiosService } from '../../services/municipios/municipios.service';
import { MunicipiosType } from '../../dto/municipios/municipios.type';
import { CreateMunicipiosInput } from '../../dto/municipios/create-municipios.input';
import { UpdateMunicipiosInput } from '../../dto/municipios/update-municipios.input';

@Resolver(() => MunicipiosType)
export class MunicipiosResolver {
	constructor(private readonly municipiosService: MunicipiosService) {}

	@Query(() => [MunicipiosType], { name: 'municipios' })
	findAll() {
		return this.municipiosService.findAll();
	}

	@Query(() => MunicipiosType, { name: 'municipio' })
	findOne(@Args('id', { type: () => Int }) id: number) {
		return this.municipiosService.findOne(id);
	}

	@Mutation(() => MunicipiosType, { name: 'createMunicipio' })
	create(@Args('input') input: CreateMunicipiosInput) {
		return this.municipiosService.create(input as any);
	}

	@Mutation(() => MunicipiosType, { name: 'updateMunicipio' })
	update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateMunicipiosInput) {
		return this.municipiosService.update(id, input as any);
	}

	@Mutation(() => Boolean, { name: 'removeMunicipio' })
	async remove(@Args('id', { type: () => Int }) id: number) {
		const res = await this.municipiosService.remove(id as any);
		return (res && (res as any).affected ? true : false);
	}
}
