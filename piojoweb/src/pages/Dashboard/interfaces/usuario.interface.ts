export interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  [key: string]: any;
}
