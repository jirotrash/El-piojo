import { Resolver, Mutation, Args } from '@nestjs/graphql';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsuariosService } from '../../../api-graphql/src/sistema-escolar/services/usuario/usuarios.service';

/**
 * Ejemplo de mutación `login(email, password)` para NestJS + GraphQL.
 * - Busca el usuario por email usando `UsuariosService`.
 * - Compara la contraseña con bcrypt.
 * - Devuelve un token JWT con el id y email del usuario.
 *
 * INTEGRACIÓN:
 * - Copia este archivo a tu módulo de resolvers (por ejemplo
 *   `src/sistema-escolar/resolvers/auth/login.resolver.ts`).
 * - Asegúrate de que `UsuariosService` tenga un método `findByEmail(email)`
 *   que retorne la entidad de usuario (con el campo `password`).
 * - Añade `JWT_SECRET` en las variables de entorno y carga
 *   con `process.env.JWT_SECRET` (o usa ConfigModule).
 */

@Resolver()
export class LoginResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => String, { name: 'login' })
  async login(@Args('email') email: string, @Args('password') password: string): Promise<string> {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
  }
}

export default LoginResolver;
