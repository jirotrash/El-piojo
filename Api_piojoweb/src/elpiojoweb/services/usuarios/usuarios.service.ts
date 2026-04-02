import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuarios } from '../../entities/usuarios/usuarios.entity';
import { CreateUsuariosInput } from '../../dto/usuarios/create-usuarios.input';
import { UpdateUsuariosInput } from '../../dto/usuarios/update-usuarios.input';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
	constructor(
		@InjectRepository(Usuarios)
		private readonly repo: Repository<Usuarios>,
	) {}

	async create(createDto: CreateUsuariosInput) {
		const dto: any = { ...createDto };

		// Check duplicate email
		if (dto.email) {
			const existing = await this.repo.findOne({ where: { email: dto.email } });
			if (existing) {
				throw new ConflictException('El correo ya está registrado');
			}
		}

		if (dto.password) {
			const salt = await bcrypt.genSalt(10);
			dto.password = await bcrypt.hash(dto.password, salt);
		}

		// Map foreign key id fields to relation objects so TypeORM sets join columns
		if (dto.id_roles) {
			dto.role = { id_roles: dto.id_roles };
			delete dto.id_roles;
		}
		if (dto.id_carreras) {
			dto.carrera = { id_carreras: dto.id_carreras };
			delete dto.id_carreras;
		}
		if (dto.id_municipios) {
			dto.municipio = { id_municipios: dto.id_municipios };
			delete dto.id_municipios;
		}

		// Ensure foto_perfil is present if provided (string)
		if (dto.foto_perfil === undefined) {
			delete dto.foto_perfil;
		}

		// DTO ready for save (debug logs removed)

		const ent = this.repo.create(dto as any);
		try {
			const saved = await this.repo.save(ent);
			return saved;
		} catch (err) {
			// If DB returns unique constraint violation unexpectedly
			throw new InternalServerErrorException(err?.message ?? 'Error al crear usuario');
		}
	}

	async findAll(opts?: { page?: number; limit?: number }) {
		const page = opts?.page ?? undefined;
		const limit = opts?.limit ?? undefined;
		const findOptions: any = { relations: ['role', 'carrera', 'municipio'], order: { id_usuarios: 'ASC' } };
		if (typeof page === 'number' && typeof limit === 'number') {
			const skip = Math.max(0, (page - 1)) * limit;
			findOptions.skip = skip;
			findOptions.take = limit;
		} else if (typeof limit === 'number') {
			findOptions.take = limit;
		}

		const ents = await this.repo.find(findOptions);
		return ents.map((e: any) => {
			const out: any = { ...e };
			out.id_roles = e.role?.id_roles ?? null;
			out.id_carreras = e.carrera?.id_carreras ?? null;
			out.id_municipios = e.municipio?.id_municipios ?? null;
			return out;
		});
	}

	async findOne(id: number) {
		const e = await this.repo.findOne({ where: { id_usuarios: id }, relations: ['role', 'carrera', 'municipio'] });
		if (!e) return null;
		const out: any = { ...e };
		out.id_roles = e.role?.id_roles ?? null;
		out.id_carreras = e.carrera?.id_carreras ?? null;
		out.id_municipios = e.municipio?.id_municipios ?? null;
		return out;
	}

	async findByEmail(email: string) {
		return this.repo.findOne({
			where: { email },
			select: {
				id_usuarios: true,
				email: true,
				password: true,
				nombre: true,
				apellido_paterno: true,
				apellido_materno: true,
				foto_perfil: true,
				telefono: true,
				matricula: true,
			},
		});
	}

	async update(id: number, updateDto: UpdateUsuariosInput) {
		const dto: any = { ...updateDto };

		// If password provided in update, hash it
		if (dto.password) {
			const salt = await bcrypt.genSalt(10);
			dto.password = await bcrypt.hash(dto.password, salt);
		}

		// Map foreign key id fields to relation objects so TypeORM sets join columns
		if (dto.id_roles !== undefined) {
			dto.role = { id_roles: dto.id_roles };
			delete dto.id_roles;
		}
		if (dto.id_carreras !== undefined) {
			dto.carrera = { id_carreras: dto.id_carreras };
			delete dto.id_carreras;
		}
		if (dto.id_municipios !== undefined) {
			dto.municipio = { id_municipios: dto.id_municipios };
			delete dto.id_municipios;
		}

		// Ensure foto_perfil is present only if provided
		if (dto.foto_perfil === undefined) {
			delete dto.foto_perfil;
		}

		await this.repo.update({ id_usuarios: id } as any, dto as any);
		return this.findOne(id);
	}

	remove(id: number) {
		return this.repo.delete({ id_usuarios: id } as any);
	}
}
