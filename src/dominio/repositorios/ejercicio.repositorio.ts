import { Ejercicio } from '../entidades/ejercicio.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Ejercicio.
 * Permite buscar ejercicios en la base de datos.
 */
export interface IEjercicioRepositorio {
  /**
   * Busca y devuelve una lista de ejercicios, opcionalmente filtrada por ID de deporte.
   * @param filtros Un objeto opcional con los criterios de búsqueda (ej. { sportId: 1 }).
   * @returns Una promesa que resuelve a un arreglo de entidades Ejercicio.
   */
  encontrar(filtros?: { sportId?: number }): Promise<Ejercicio[]>;
}
