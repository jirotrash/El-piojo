import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversaciones } from '../../entities/conversaciones/conversaciones.entity';
import { CreateConversacionesInput } from '../../dto/conversaciones/create-conversaciones.input';
import { UpdateConversacionesInput } from '../../dto/conversaciones/update-conversaciones.input';

@Injectable()
export class ConversacionesService {
	constructor(
		@InjectRepository(Conversaciones)
		private readonly repo: Repository<Conversaciones>,
	) {}

	create(createDto: CreateConversacionesInput) {
		const ent = this.repo.create(createDto as any);
		return this.repo.save(ent);
	}

	findAll() {
		return this.repo.find({ relations: ['vendedor', 'comprador', 'publicacion'] });
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_conversaciones: id }, relations: ['vendedor', 'comprador', 'publicacion'] });
	}

	async update(id: number, updateDto: UpdateConversacionesInput) {
		await this.repo.update({ id_conversaciones: id } as any, updateDto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_conversaciones: id } as any);
	}
}
