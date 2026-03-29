import React from 'react';

/**
 * RequireAdmin desactivado: permite siempre acceso al dashboard.
 * Para restaurar la comprobación de admin revierte este archivo o reintroduce la lógica necesaria.
 */
export const RequireAdmin = ({ children }: { children: JSX.Element; redirectTo?: string }) => {
  return children;
};

export default RequireAdmin;
