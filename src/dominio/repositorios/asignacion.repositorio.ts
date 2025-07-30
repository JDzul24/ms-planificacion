import { Asignacion } from '../entidades/asignacion.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Asignacion.
 */
export interface IAsignacionRepositorio {
  /**
   * Guarda múltiples nuevas asignaciones en la base de datos de forma transaccional.
   * @param asignaciones Un arreglo de entidades Asignacion a persistir.
   */
  guardarMultiples(asignaciones: Asignacion[]): Promise<void>;

  /**
   * Busca todas las asignaciones (planes) para un atleta específico.
   * @param atletaId El ID del atleta cuyas asignaciones se buscan.
   * @returns Una promesa que resuelve a un arreglo de entidades Asignacion.
   */
  encontrarPorAtletaId(atletaId: string): Promise<Asignacion[]>;

  /**
   * Busca una asignación específica por su ID.
   * @param id El UUID de la asignación a buscar.
   * @returns Una promesa que resuelve a la entidad Asignacion si se encuentra, o null en caso contrario.
   */
  encontrarPorId(id: string): Promise<Asignacion | null>;

  /**
   * Elimina una asignación específica de la base de datos.
   * @param id El UUID de la asignación a eliminar.
   * @returns Una promesa que resuelve cuando la eliminación se completa exitosamente.
   */
  eliminar(id: string): Promise<void>;

  /**
   * Actualiza el estado de una asignación específica.
   * @param id El UUID de la asignación a actualizar.
   * @param nuevoEstado El nuevo estado para la asignación.
   * @returns Una promesa que resuelve a la entidad Asignacion actualizada.
   */
  actualizarEstado(id: string, nuevoEstado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA'): Promise<Asignacion>;

  /**
   * Verifica si una asignación pertenece a un entrenador específico.
   * @param asignacionId El ID de la asignación a validar.
   * @param entrenadorId El ID del entrenador que debe ser el propietario.
   * @returns Una promesa que resuelve a `true` si la asignación le pertenece, `false` en caso contrario.
   */
  validarPropietario(asignacionId: string, entrenadorId: string): Promise<boolean>;
}
