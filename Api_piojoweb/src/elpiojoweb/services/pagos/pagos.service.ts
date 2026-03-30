import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagos } from '../../entities/pagos/pagos.entity';
import { CreatePagosInput } from '../../dto/pagos/create-pagos.input';
import { UpdatePagosInput } from '../../dto/pagos/update-pagos.input';

@Injectable()
export class PagosService {
	constructor(
		@InjectRepository(Pagos)
		private readonly repo: Repository<Pagos>,
	) {}

	async create(createDto: CreatePagosInput) {
		const ent = this.repo.create(createDto as any);
		if (createDto.id_usuarios_pagador) {
			(ent as any).pagador = { id_usuarios: createDto.id_usuarios_pagador };
		}
		const saved = await this.repo.save(ent) as any;
		return this.repo.findOne({ where: { id_pagos: saved.id_pagos }, relations: ['pagador'] });
	}

	findAll() {
		return this.repo.find();
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_pagos: id } });
	}

	async update(id: number, updateDto: UpdatePagosInput) {
		await this.repo.update({ id_pagos: id } as any, updateDto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_pagos: id } as any);
	}
}
