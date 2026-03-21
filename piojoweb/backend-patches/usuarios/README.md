Instrucciones para integrar las mutaciones de `usuarios` en tu backend (NestJS + GraphQL)

1) Dónde colocar los archivos

- Copia `create-usuario.input.ts` en `src/sistema-escolar/dtos/usuario/create-usuario.input.ts`
- Copia `update-usuario.input.ts` en `src/sistema-escolar/dtos/usuario/update-usuario.input.ts`
- Copia `usuarios.resolver.ts` en `src/sistema-escolar/resolvers/usuario/usuarios.resolver.ts`

2) Ajustar imports

- En `usuarios.resolver.ts` ajusta las rutas de importación a tu estructura real. El ejemplo usa rutas relativas a un proyecto típico `api-graphql/src/sistema-escolar/...`.
- Si tienes un `UsuariosType` (GraphQL ObjectType) definido, reemplaza `Object` en `@Resolver(() => Object)` y en los `@Mutation(() => Object)` por la clase correcta.

3) Implementar métodos en el servicio

- Si ya tienes `UsuariosService`, añade/asegura que existan los métodos:
  - `create(createDto: CreateUsuarioInput)` -> crea y retorna la entidad creada.
  - `update(id: number, updateDto: UpdateUsuarioInput)` -> actualiza y retorna la entidad.
  - `remove(id: number)` -> elimina y retorna `true`/`false`.

Ejemplo mínimo (UsuariosService):
```ts
async create(input: CreateUsuarioInput) {
  const entity = this.repo.create(input);
  return await this.repo.save(entity);
}

async update(id: number, input: UpdateUsuarioInput) {
  await this.repo.update(id, input);
  return this.repo.findOne({ where: { id } });
}

async remove(id: number) {
  const res = await this.repo.delete(id);
  return res.affected > 0;
}
```

4) Registrar el resolver en el módulo

- En `sistema-escolar.module.ts` (o el módulo donde centralices resolvers), añade `UsuariosResolver` a `providers`.

5) Regenerar el esquema

- Si usas `@nestjs/graphql` con generación automática de schema, reinicia el servidor y verifica `src/schema.gql` (o la URL GraphQL Playground) para ver las nuevas mutaciones `createUsuario`, `updateUsuario`, `removeUsuario`.

6) Probar desde frontend

- Reinicia tu frontend (`npm run dev`) y prueba crear/editar/eliminar desde `UsuariosPage`. Ahora las llamadas a las mutaciones deberían persistir en la base de datos.

Si quieres, puedo intentar aplicar estos cambios directamente en tu carpeta `api-graphql` si mueves ese proyecto dentro del workspace o me indicas la ruta exacta dentro del workspace para modificarla automáticmente.
