import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipios } from '../../entities/municipios/municipios.entity';
import { CreateMunicipiosInput } from '../../dto/municipios/create-municipios.input';
import { UpdateMunicipiosInput } from '../../dto/municipios/update-municipios.input';

@Injectable()
export class MunicipiosService {
	constructor(
		@InjectRepository(Municipios)
		private readonly repo: Repository<Municipios>,
	) {}

	create(createDto: CreateMunicipiosInput) {
		// If caller provides id_estados, map it into the relation field so TypeORM sets the FK.
		const payload: any = { ...createDto };
		if ((createDto as any).id_estados) {
			payload.estado = { id_estados: (createDto as any).id_estados };
			delete payload.id_estados;
		}
		const ent = this.repo.create(payload as any);
		return this.repo.save(ent);
	}

	findAll() {
		return this.repo.find({ relations: ['estado'] }).then(list =>
			list.map(item => ({ ...item, id_estados: item.estado ? (item.estado as any).id_estados : null }))
		);
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_municipios: id }, relations: ['estado'] }).then(item =>
			item ? ({ ...item, id_estados: item.estado ? (item.estado as any).id_estados : null }) : null
		);
	}

	async update(id: number, updateDto: UpdateMunicipiosInput) {
		const payload: any = { ...updateDto };
		if ((updateDto as any).id_estados) {
			payload.estado = { id_estados: (updateDto as any).id_estados };
			delete payload.id_estados;
		}
		await this.repo.update({ id_municipios: id } as any, payload as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_municipios: id } as any);
	}
}
