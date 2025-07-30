import { EjercicioDetalleDto } from '../dtos/ejercicio-detalle.dto';

/**
 * DTO para representar los detalles completos de una rutina,
 * incluyendo la lista de sus ejercicios.
 * Esta es la estructura que se devolverá en la respuesta de la API.
 */
export class RutinaDetallesDto {
  /**
   * El identificador único (UUID) de la rutina.
   */
  id: string;

  /**
   * El nombre de la rutina (ej. "Rutina de Potencia para Pelea").
   */
  nombre: string;

  /**
   * El nivel de dificultad al que está dirigida la rutina (ej. "Intermedio").
   */
  nivel: string;

  /**
   * La descripción opcional de la rutina.
   */
  descripcion?: string | null;

  /**
   * Un arreglo que contiene los detalles de cada ejercicio dentro de la rutina.
   */
  ejercicios: EjercicioDetalleDto[];
}
