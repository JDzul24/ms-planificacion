interface DeporteProps {
  id: number;
  nombre: string;
  descripcion?: string;
}

export class Deporte {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion?: string;

  private constructor(props: DeporteProps) {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new Error('El nombre del deporte es requerido.');
    }

    this.id = props.id;
    this.nombre = props.nombre.trim();
    this.descripcion = props.descripcion?.trim();
  }

  public static crear(props: {
    nombre: string;
    descripcion?: string;
  }): Deporte {
    return new Deporte({
      id: 0, // Se asignará por la base de datos
      nombre: props.nombre,
      descripcion: props.descripcion,
    });
  }

  public static desdePersistencia(props: DeporteProps): Deporte {
    return new Deporte(props);
  }
}