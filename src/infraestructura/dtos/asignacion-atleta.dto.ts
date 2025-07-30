/**
 * DTO para representar un plan (rutina o meta) asignado a un atleta.
 * Esta es la estructura que recibirá el frontend del atleta.
 */
export class AsignacionAtletaDto {
  /**
   * El ID único de la asignación.
   */
  id: string;

  /**
   * El nombre de la rutina asignada.
   */
  nombreRutina: string;

  /**
   * El nombre del entrenador que asignó la rutina.
   */
  nombreEntrenador: string;

  /**
   * El estado actual de la asignación.
   */
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';

  /**
   * La fecha en que se realizó la asignación.
   */
  fechaAsignacion: Date;

  /**
   * El ID de la rutina asignada.
   */
  rutinaId: string;

  /**
   * El ID del entrenador que realizó la asignación.
   */
  assignerId: string;
}
