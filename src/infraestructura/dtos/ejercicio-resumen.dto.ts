/**
 * DTO para representar la información de resumen de un ejercicio en una lista.
 */
export class EjercicioResumenDto {
  /**
   * El identificador único (UUID) del ejercicio.
   */
  id: string;

  /**
   * El nombre del ejercicio (ej. "Salto de Cuerda").
   */
  nombre: string;

  /**
   * Una descripción breve del ejercicio.
   */
  descripcion: string | null;
}
