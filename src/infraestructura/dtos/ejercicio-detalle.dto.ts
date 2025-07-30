/**
 * DTO para representar los detalles de un único ejercicio
 * dentro de la respuesta de una rutina detallada.
 */
export class EjercicioDetalleDto {
  /**
   * El identificador único (UUID) del ejercicio.
   */
  id: string;

  /**
   * El nombre del ejercicio (ej. "Salto de Cuerda", "Sombra de 3 Rounds").
   */
  nombre: string;

  /**
   * La descripción del ejercicio.
   */
  descripcion?: string;

  /**
   * La descripción de las series, repeticiones o tiempo para este ejercicio
   * dentro del contexto de la rutina (ej. "3x15", "5 minutos").
   */
  setsReps: string | null;

  /**
   * La duración estimada del ejercicio en segundos.
   */
  duracionEstimadaSegundos: number;

  /**
   * La categoría del ejercicio para organización en el frontend.
   */
  categoria: 'calentamiento' | 'resistencia' | 'tecnica';
}
