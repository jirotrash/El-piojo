import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePublicaciones } from '../../entities/detalle_publicaciones/detalle_publicaciones.entity';
import { CreateDetallePublicacionesInput } from '../../dto/detalle_publicaciones/create-detalle_publicaciones.input';
import { UpdateDetallePublicacionesInput } from '../../dto/detalle_publicaciones/update-detalle_publicaciones.input';

@Injectable()
export class DetallePublicacionesService {
	constructor(
		@InjectRepository(DetallePublicaciones)
		private readonly repo: Repository<DetallePublicaciones>,
	) {}

	create(createDto: CreateDetallePublicacionesInput) {
		const ent = this.repo.create(createDto as any);
		return this.repo.save(ent);
	}

	findAll() {
		return this.repo.find();
	}

	// return detalle_publicaciones rows that are not linked to any publicacion (id_publicaciones IS NULL)
	findOrphans() {
		return this.repo.createQueryBuilder('d')
			.where('d.id_publicaciones IS NULL')
			.orderBy('d.id_detalle_publicaciones', 'ASC')
			.getMany();
	}

	async assignToPublication(detalleId: number, publicacionId: number) {
		// use update to set relation
		await this.repo.createQueryBuilder()
			.update()
			.set({ publicacion: { id_publicaciones: publicacionId } as any })
			.where({ id_detalle_publicaciones: detalleId })
			.execute();
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_detalle_publicaciones: id } });
	}

	async update(id: number, updateDto: UpdateDetallePublicacionesInput) {
		await this.repo.update({ id_detalle_publicaciones: id } as any, updateDto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_detalle_publicaciones: id } as any);
	}
}
