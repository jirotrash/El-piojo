import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
// Ajusta las rutas de importación según la estructura de tu backend
import { UsuariosService } from '../../../api-graphql/src/sistema-escolar/services/usuario/usuarios.service';
import { CreateUsuarioInput } from '../../../api-graphql/src/sistema-escolar/dtos/usuario/create-usuario.input';
import { UpdateUsuarioInput } from '../../../api-graphql/src/sistema-escolar/dtos/usuario/update-usuario.input';
// Si tu proyecto define un GraphQL ObjectType para Usuarios, importa aquí la clase
// import { UsuariosType } from '../entities/usuarios/usuarios.entity';

/**
 * Plantilla de resolver para `usuarios`.
 * Copia este archivo dentro de `sistema-escolar/resolvers/usuario/` y ajusta las rutas.
 */
@Resolver(() => Object)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => Object)
  async createUsuario(@Args('createUsuarioInput') createUsuarioInput: CreateUsuarioInput) {
    return this.usuariosService.create(createUsuarioInput);
  }

  @Mutation(() => Object)
  async updateUsuario(@Args('updateUsuarioInput') updateUsuarioInput: UpdateUsuarioInput) {
    return this.usuariosService.update(updateUsuarioInput.id, updateUsuarioInput);
  }

  @Mutation(() => Boolean)
  async removeUsuario(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.remove(id);
  }
}

export default UsuariosResolver;
