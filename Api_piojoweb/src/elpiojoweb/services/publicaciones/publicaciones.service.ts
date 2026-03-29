import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicaciones } from '../../entities/publicaciones/publicaciones.entity';
import { CreatePublicacionesInput } from '../../dto/publicaciones/create-publicaciones.input';
import { UpdatePublicacionesInput } from '../../dto/publicaciones/update-publicaciones.input';

@Injectable()
export class PublicacionesService {
	constructor(
		@InjectRepository(Publicaciones)
		private readonly repo: Repository<Publicaciones>,
	) {}

	create(createDto: CreatePublicacionesInput) {
		const ent = this.repo.create(createDto as any);
		return this.repo.save(ent);
	}

	findAll() {
		// Include relations so resolver can map FK scalar fields (usuario, punto_entrega)
		// and load fotos so GraphQL can return detallePublicaciones
		return this.repo.find({ relations: ['usuario', 'punto_entrega', 'fotos'] });
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_publicaciones: id }, relations: ['usuario', 'punto_entrega', 'fotos'] });
	}

	// publicaciones that currently have no detalle_publicaciones linked
	findWithoutFotos() {
		return this.repo.createQueryBuilder('p')
			.leftJoin('p.fotos', 'f')
			.where('f.id_detalle_publicaciones IS NULL')
			.getMany();
	}

	async update(id: number, updateDto: UpdatePublicacionesInput) {
		await this.repo.update({ id_publicaciones: id } as any, updateDto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_publicaciones: id } as any);
	}
}
