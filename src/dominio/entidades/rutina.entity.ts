import { randomUUID } from 'crypto';

// Tipo para los ejercicios en la rutina (datos necesarios)
export interface EjercicioEnRutina {
  id: string;
  nombre?: string; // Opcional para compatibilidad con otros servicios
  descripcion?: string | null; // Opcional para compatibilidad con otros servicios
  setsReps: string;
  duracionEstimadaSegundos: number;
}

export class Rutina {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: string;
  readonly coachId: string;
  readonly sportId: number;
  readonly descripcion?: string;
  public ejercicios: EjercicioEnRutina[];

  private constructor(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    descripcion?: string;
    ejercicios: EjercicioEnRutina[];
  }) {
    if (!props.nombre) throw new Error('El nombre de la rutina es requerido.');
    if (props.ejercicios.length === 0)
      throw new Error('Una rutina debe tener al menos un ejercicio.');

    this.id = props.id;
    this.nombre = props.nombre;
    this.nivel = props.nivel;
    this.coachId = props.coachId;
    this.sportId = props.sportId;
    this.descripcion = props.descripcion;
    this.ejercicios = props.ejercicios;
  }

  public static crear(props: {
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    descripcion?: string;
    ejercicios: {
      exerciseId: string;
      setsReps: string;
      duracionEstimadaSegundos?: number;
    }[];
  }): Rutina {
    // No necesitamos crear entidades Ejercicio aquí, solo almacenar los datos
    // Los ejercicios ya están guardados en la BD con sus nombres correctos
    const ejerciciosData = props.ejercicios.map((e) => ({
      id: e.exerciseId,
      setsReps: e.setsReps,
      duracionEstimadaSegundos: e.duracionEstimadaSegundos ?? 0,
    }));

    return new Rutina({
      id: randomUUID(),
      nombre: props.nombre,
      nivel: props.nivel,
      coachId: props.coachId,
      sportId: props.sportId,
      descripcion: props.descripcion,
      ejercicios: ejerciciosData,
    });
  }

  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    descripcion?: string;
    ejercicios: EjercicioEnRutina[];
  }): Rutina {
    return new Rutina(props);
  }

  /**
   * Calcula la duración total estimada de la rutina.
   * El código ahora es seguro a nivel de tipos.
   */
  public calcularDuracionEstimadaSegundos(): number {
    return this.ejercicios.reduce(
      (total, ejercicio) => total + ejercicio.duracionEstimadaSegundos,
      0,
    );
  }
}
