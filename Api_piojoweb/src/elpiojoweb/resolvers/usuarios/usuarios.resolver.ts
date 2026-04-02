import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { UsuariosType } from '../../dto/usuarios/usuarios.type';
import { CreateUsuariosInput } from '../../dto/usuarios/create-usuarios.input';
import { UpdateUsuariosInput } from '../../dto/usuarios/update-usuarios.input';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Resolver(() => UsuariosType)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Query(() => [UsuariosType], { name: 'usuarios' })
  findAll(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usuariosService.findAll({ page, limit });
  }

  @Query(() => UsuariosType, { name: 'usuario' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Mutation(() => UsuariosType, { name: 'createUsuario' })
  create(@Args('input') input: CreateUsuariosInput) {
    return this.usuariosService.create(input as any);
  }

  @Mutation(() => String, { name: 'login' })
  async login(@Args('email') email: string, @Args('password') password: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas (usuario no encontrado)');
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      throw new Error('Credenciales inválidas (contraseña incorrecta)');
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = { sub: (user as any).id_usuarios, email: (user as any).email };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
  }

  @Mutation(() => UsuariosType, { name: 'updateUsuario' })
  update(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateUsuariosInput) {
    return this.usuariosService.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'removeUsuario' })
  async remove(@Args('id', { type: () => Int }) id: number) {
    const res: any = await this.usuariosService.remove(id);
    return (res?.affected ?? 0) > 0;
  }
}

