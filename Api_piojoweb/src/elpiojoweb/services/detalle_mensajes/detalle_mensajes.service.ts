import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleMensajes } from '../../entities/detalle_mensajes/detalle_mensajes.entity';
import { CreateDetalleMensajesInput } from '../../dto/detalle_mensajes/create-detalle_mensajes.input';
import { UpdateDetalleMensajesInput } from '../../dto/detalle_mensajes/update-detalle_mensajes.input';

@Injectable()
export class DetalleMensajesService {
	constructor(
		@InjectRepository(DetalleMensajes)
		private readonly repo: Repository<DetalleMensajes>,
	) {}

	async create(createDto: CreateDetalleMensajesInput) {
		// Ensure relations are set so TypeORM writes the foreign key columns.
		console.debug('DetalleMensajesService.create input:', createDto);
		const ent = this.repo.create(createDto as any);
		// If caller provided numeric FK ids, assign relation objects so join columns are populated.
		try {
			if ((createDto as any).id_conversaciones != null) {
				(ent as any).conversacion = { id_conversaciones: Number((createDto as any).id_conversaciones) } as any;
			}
			if ((createDto as any).id_emisor != null) {
				(ent as any).emisor = { id_usuarios: Number((createDto as any).id_emisor) } as any;
			}
		} catch (e) {
			// ignore mapping errors and rely on raw input as fallback
		}
		console.debug('DetalleMensajesService.create entity prepared:', { conversacion: (ent as any).conversacion, emisor: (ent as any).emisor, mensaje: (ent as any).mensaje });
		const saved = await this.repo.save(ent as any);
		console.debug('DetalleMensajesService.create saved id:', (saved as any).id_detalle_mensajes);
		// Return the entity with relations populated so GraphQL can resolve emisor/conversacion fields
		return this.findOne((saved as any).id_detalle_mensajes);
	}

	findAll() {
		return this.repo.find({ relations: ['conversacion', 'emisor'] });
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id_detalle_mensajes: id }, relations: ['conversacion', 'emisor'] });
	}

	async update(id: number, updateDto: UpdateDetalleMensajesInput) {
		await this.repo.update({ id_detalle_mensajes: id } as any, updateDto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_detalle_mensajes: id } as any);
	}
}
