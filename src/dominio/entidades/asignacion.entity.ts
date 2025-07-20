import { randomUUID } from 'crypto';

type EstadoAsignacion = 'PENDIENTE' | 'COMPLETADA' | 'EN_PROGRESO';

interface AsignacionProps {
  id: string;
  atletaId: string;
  assignerId: string; // ID del entrenador que asigna
  rutinaId?: string;
  metaId?: string;
  status: EstadoAsignacion;
  assignedAt: Date;
}

export class Asignacion {
  readonly id: string;
  readonly atletaId: string;
  readonly assignerId: string;
  readonly rutinaId?: string;
  readonly metaId?: string;
  public status: EstadoAsignacion;
  readonly assignedAt: Date;

  private constructor(props: AsignacionProps) {
    this.id = props.id;
    this.atletaId = props.atletaId;
    this.assignerId = props.assignerId;
    this.rutinaId = props.rutinaId;
    this.metaId = props.metaId;
    this.status = props.status;
    this.assignedAt = props.assignedAt;
  }

  /**
   * Método de fábrica para crear una nueva instancia de Asignacion.
   */
  public static crear(props: {
    atletaId: string;
    assignerId: string;
    rutinaId?: string;
    metaId?: string;
  }): Asignacion {
    // Validación de dominio: debe tener una rutina o una meta, pero no ambas.
    if (!props.rutinaId && !props.metaId) {
      throw new Error('La asignación debe tener una rutina o una meta.');
    }
    if (props.rutinaId && props.metaId) {
      throw new Error(
        'La asignación no puede tener una rutina y una meta a la vez.',
      );
    }

    return new Asignacion({
      id: randomUUID(),
      atletaId: props.atletaId,
      assignerId: props.assignerId,
      rutinaId: props.rutinaId,
      metaId: props.metaId,
      status: 'PENDIENTE',
      assignedAt: new Date(),
    });
  }

  /**
   * Método para reconstituir la entidad desde la persistencia.
   */
  public static desdePersistencia(props: AsignacionProps): Asignacion {
    return new Asignacion(props);
  }
}
