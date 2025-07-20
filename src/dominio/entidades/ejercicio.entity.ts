import { randomUUID } from 'crypto';

export class Ejercicio {
  readonly id: string;
  readonly nombre: string;
  readonly setsReps: string | null;
  readonly descripcion: string | null; // <-- NUEVA PROPIEDAD

  private constructor(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
    descripcion: string | null; // <-- NUEVA PROPIEDAD
  }) {
    if (!props.nombre) throw new Error('El nombre del ejercicio es requerido.');
    this.id = props.id;
    this.nombre = props.nombre;
    this.setsReps = props.setsReps;
    this.descripcion = props.descripcion; // <-- Asignar la nueva propiedad
  }

  /**
   * Método de fábrica para crear una nueva instancia de Ejercicio.
   * Esto sería utilizado cuando un entrenador crea un nuevo ejercicio en el catálogo.
   */
  public static crear(props: {
    nombre: string;
    setsReps?: string; // Opcional al crear si no es parte de una rutina específica aún
    descripcion?: string;
  }): Ejercicio {
    return new Ejercicio({
      id: randomUUID(),
      nombre: props.nombre,
      setsReps: props.setsReps || null,
      descripcion: props.descripcion || null,
    });
  }

  /**
   * Método para reconstituir la entidad Ejercicio desde los datos de la persistencia (base de datos).
   */
  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
    descripcion: string | null; // <-- NUEVA PROPIEDAD
  }): Ejercicio {
    return new Ejercicio(props);
  }
}
