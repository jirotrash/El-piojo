import React from 'react';
import { RequireAuth } from './AuthProvider';

/**
 * RequireAdmin: protege las rutas del dashboard forzando inicio de sesión.
 * Actualmente sólo comprueba autenticación; validar rol requiere llamada al backend.
 */
export const RequireAdmin = ({ children, redirectTo = '/dashboard/login' }: { children: JSX.Element; redirectTo?: string }) => {
  return <RequireAuth redirectTo={redirectTo}>{children}</RequireAuth>;
};

export default RequireAdmin;
