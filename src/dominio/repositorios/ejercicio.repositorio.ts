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

  /**
   * Busca un ejercicio por su ID.
   * @param id El ID del ejercicio a buscar.
   * @returns Una promesa que resuelve a una entidad Ejercicio o null si no existe.
   */
  encontrarPorId(id: string): Promise<Ejercicio | null>;

  /**
   * Guarda un ejercicio en la base de datos.
   * @param ejercicio La entidad Ejercicio a guardar.
   * @param categoria La categoría del ejercicio.
   * @param sportId El ID del deporte al que pertenece.
   * @returns Una promesa que resuelve a la entidad Ejercicio guardada.
   */
  guardar(ejercicio: Ejercicio, categoria?: string, sportId?: number): Promise<Ejercicio>;
}
