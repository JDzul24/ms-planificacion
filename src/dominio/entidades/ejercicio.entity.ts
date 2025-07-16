export class Ejercicio {
  readonly id: string;
  readonly nombre: string;
  readonly setsReps: string | null;

  private constructor(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
  }) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.setsReps = props.setsReps;
  }

  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
  }): Ejercicio {
    return new Ejercicio(props);
  }
}
