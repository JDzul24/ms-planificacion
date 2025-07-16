import { Rutina } from '../entidades/rutina.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Rutina.
 */
export interface IRutinaRepositorio {
  /**
   * Guarda una nueva rutina y sus ejercicios asociados en la base de datos.
   * @param rutina La entidad Rutina a persistir.
   * @returns Una promesa que resuelve a la entidad Rutina guardada.
   */
  guardar(rutina: Rutina): Promise<Rutina>;

  /**
   * Busca y devuelve una lista de rutinas, opcionalmente filtrada por nivel.
   * @param filtros Un objeto opcional con los criterios de búsqueda, como el nivel.
   * @returns Una promesa que resuelve a un arreglo de entidades Rutina.
   */
  encontrar(filtros?: { nivel?: string }): Promise<Rutina[]>;

  /**
   * Busca una única rutina por su identificador.
   * @param id El UUID de la rutina a buscar.
   * @returns Una promesa que resuelve a la entidad Rutina si se encuentra, o null en caso contrario.
   */
  encontrarPorId(id: string): Promise<Rutina | null>;
}
