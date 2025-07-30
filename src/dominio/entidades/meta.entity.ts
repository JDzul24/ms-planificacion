import { randomUUID } from 'crypto';

interface MetaProps {
  id: string;
  creadorId: string;
  descripcion: string;
  fechaLimite?: Date;
  createdAt: Date;
}

export class Meta {
  readonly id: string;
  readonly creadorId: string;
  readonly descripcion: string;
  readonly fechaLimite?: Date;
  readonly createdAt: Date;

  private constructor(props: MetaProps) {
    if (!props.descripcion || props.descripcion.trim().length === 0) {
      throw new Error('La descripción de la meta es requerida.');
    }

    this.id = props.id;
    this.creadorId = props.creadorId;
    this.descripcion = props.descripcion.trim();
    this.fechaLimite = props.fechaLimite;
    this.createdAt = props.createdAt;
  }

  public static crear(props: {
    creadorId: string;
    descripcion: string;
    fechaLimite?: Date;
  }): Meta {
    return new Meta({
      id: randomUUID(),
      creadorId: props.creadorId,
      descripcion: props.descripcion,
      fechaLimite: props.fechaLimite,
      createdAt: new Date(),
    });
  }

  public static desdePersistencia(props: MetaProps): Meta {
    return new Meta(props);
  }
}