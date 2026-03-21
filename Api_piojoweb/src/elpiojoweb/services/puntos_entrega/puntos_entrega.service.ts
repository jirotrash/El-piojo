import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PuntosEntrega } from '../../entities/puntos_entrega/puntos_entrega.entity';
import { CreatePuntosEntregaInput } from '../../dto/puntos_entrega/create-puntos_entrega.input';
import { UpdatePuntosEntregaInput } from '../../dto/puntos_entrega/update-puntos_entrega.input';

@Injectable()
export class PuntosEntregaService {
	constructor(
		@InjectRepository(PuntosEntrega)
		private readonly repo: Repository<PuntosEntrega>,
	) {}

	create(createDto: CreatePuntosEntregaInput) {
		const ent = this.repo.create(createDto as any);
		if ((createDto as any).id_municipios != null) {
			(ent as any).municipio = { id_municipios: (createDto as any).id_municipios } as any;
		}
		return this.repo.save(ent).then((saved: any) => this.findOne(saved.id_puntos_entrega));
	}

	findAll() {
		return this.repo.find({ relations: ['municipio'] }).then((rows: any[]) =>
			rows.map((r) => ({ ...r, id_municipios: r.municipio ? r.municipio.id_municipios : undefined }))
		);
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_puntos_entrega: id }, relations: ['municipio'] }).then((r: any) =>
			r ? { ...r, id_municipios: r.municipio ? r.municipio.id_municipios : undefined } : r
		);
	}

	async update(id: number, updateDto: UpdatePuntosEntregaInput) {
		// Debug: log incoming update DTO
		// eslint-disable-next-line no-console
		console.debug('[PuntosEntregaService] update id=', id, 'dto=', updateDto);

		// Load existing entity, merge updates and save — this ensures relations are handled correctly
		const existing: any = await this.repo.findOne({ where: { id_puntos_entrega: id }, relations: ['municipio'] });
		if (!existing) return null;
		if ((updateDto as any).id_municipios != null) {
			existing.municipio = { id_municipios: (updateDto as any).id_municipios } as any;
		}
		if ((updateDto as any).nombre != null) existing.nombre = (updateDto as any).nombre;
		if ((updateDto as any).latitud != null) existing.latitud = (updateDto as any).latitud;
		if ((updateDto as any).longitud != null) existing.longitud = (updateDto as any).longitud;
		if ((updateDto as any).descripcion !== undefined) existing.descripcion = (updateDto as any).descripcion;

		const saved = await this.repo.save(existing as any);
		// eslint-disable-next-line no-console
		console.debug('[PuntosEntregaService] saved=', saved);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_puntos_entrega: id } as any);
	}
}
