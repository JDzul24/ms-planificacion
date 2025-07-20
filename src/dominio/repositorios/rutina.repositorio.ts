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

  /**
   * --- CORRECCIÓN AQUÍ: Se añade la declaración del método faltante ---
   * Verifica si una rutina existe y si pertenece a un coach específico.
   * @param rutinaId El ID de la rutina a validar.
   * @param coachId El ID del coach que debe ser el propietario.
   * @returns Una promesa que resuelve a `true` si la rutina existe y le pertenece, `false` en caso contrario.
   */
  validarExistenciaYPropietario(
    rutinaId: string,
    coachId: string,
  ): Promise<boolean>;
}
