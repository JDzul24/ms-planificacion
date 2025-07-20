/**
 * DTO para representar un plan (rutina o meta) asignado a un atleta.
 * Esta es la estructura que recibirá el frontend del atleta.
 */
export class AsignacionAtletaDto {
  /**
   * El ID único de la asignación.
   */
  idAsignacion: string;

  /**
   * El tipo de plan asignado ('Rutina' o 'Meta').
   */
  tipoPlan: 'Rutina' | 'Meta';

  /**
   * El ID del plan asignado (ya sea de la rutina o de la meta).
   */
  idPlan: string;

  /**
   * El nombre o descripción del plan asignado.
   */
  nombrePlan: string; // <-- NUEVA PROPIEDAD ENRIQUECIDA

  /**
   * El ID del entrenador que realizó la asignación.
   */
  idAsignador: string;

  /**
   * El estado actual de la asignación (ej. 'PENDIENTE').
   */
  estado: string;

  /**
   * La fecha en que se realizó la asignación.
   */
  fechaAsignacion: Date;
}
