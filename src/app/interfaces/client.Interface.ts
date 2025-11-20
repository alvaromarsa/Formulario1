export interface Cliente {
  // JSON Server le añade el ID automáticamente
  id?: number | string;

  nombre: string;
  apellido1: string;
  apellido2: string;
  direccion: string;
  telefono: string;
  sexo: 'hombre' | 'mujer'; // Usamos un "literal union type" para tipar las opciones del radio
}
