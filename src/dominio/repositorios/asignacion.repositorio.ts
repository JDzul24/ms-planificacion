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
}
