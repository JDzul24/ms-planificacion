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
   * Busca y devuelve una lista de rutinas, con filtros opcionales.
   * @param filtros Un objeto opcional con criterios de búsqueda como nivel o una lista de IDs.
   * @returns Una promesa que resuelve a un arreglo de entidades Rutina.
   */
  encontrar(filtros?: { nivel?: string; ids?: string[] }): Promise<Rutina[]>;

  /**
   * Busca una única rutina por su identificador.
   * @param id El UUID de la rutina a buscar.
   * @returns Una promesa que resuelve a la entidad Rutina si se encuentra, o null en caso contrario.
   */
  encontrarPorId(id: string): Promise<Rutina | null>;

  /**
   * Verifica si una rutina existe y si pertenece a un coach específico.
   * @param rutinaId El ID de la rutina a validar.
   * @param coachId El ID del coach que debe ser el propietario.
   * @returns Una promesa que resuelve a `true` si la rutina existe y le pertenece, `false` en caso contrario.
   */
  validarExistenciaYPropietario(
    rutinaId: string,
    coachId: string,
  ): Promise<boolean>;

  /**
   * Elimina una rutina y todas sus relaciones asociadas de la base de datos.
   * @param id El UUID de la rutina a eliminar.
   * @returns Una promesa que resuelve cuando la eliminación se completa exitosamente.
   */
  eliminar(id: string): Promise<void>;

  /**
   * Actualiza una rutina existente en la base de datos.
   * @param id El UUID de la rutina a actualizar.
   * @param datosActualizacion Los datos parciales para actualizar la rutina.
   * @returns Una promesa que resuelve a la entidad Rutina actualizada.
   */
  actualizar(id: string, datosActualizacion: {
    nombre?: string;
    nivel?: string;
    descripcion?: string;
    ejercicios?: {
      exerciseId: string;
      setsReps: string;
      duracionEstimadaSegundos?: number;
    }[];
  }): Promise<Rutina>;
}
