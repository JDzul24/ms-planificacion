import { randomUUID } from 'crypto';

export class Ejercicio {
  readonly id: string;
  readonly nombre: string;
  readonly setsReps: string | null;
  readonly descripcion: string | null;

  /**
   * --- NUEVA PROPIEDAD ---
   * La duración estimada para completar este ejercicio, en segundos.
   */
  readonly duracionEstimadaSegundos: number;

  private constructor(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
    descripcion: string | null;
    duracionEstimadaSegundos: number; // <-- AÑADIDO
  }) {
    if (!props.nombre) throw new Error('El nombre del ejercicio es requerido.');

    this.id = props.id;
    this.nombre = props.nombre;
    this.setsReps = props.setsReps;
    this.descripcion = props.descripcion;
    this.duracionEstimadaSegundos = props.duracionEstimadaSegundos; // <-- AÑADIDO
  }

  /**
   * Método de fábrica para crear una nueva instancia de Ejercicio.
   */
  public static crear(props: {
    nombre: string;
    setsReps?: string;
    descripcion?: string;
    duracionEstimadaSegundos?: number; // <-- AÑADIDO
  }): Ejercicio {
    return new Ejercicio({
      id: randomUUID(),
      nombre: props.nombre,
      setsReps: props.setsReps || null,
      descripcion: props.descripcion || null,
      duracionEstimadaSegundos: props.duracionEstimadaSegundos || 0, // <-- AÑADIDO
    });
  }

  /**
   * Método para reconstituir la entidad Ejercicio desde los datos de la persistencia.
   */
  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    setsReps: string | null;
    descripcion: string | null;
    duracionEstimadaSegundos: number; // <-- AÑADIDO
  }): Ejercicio {
    return new Ejercicio(props);
  }
}
