import { randomUUID } from 'crypto';
import { Ejercicio } from './ejercicio.entity';

export class Rutina {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: string;
  readonly coachId: string;
  readonly sportId: number;
  public ejercicios: Ejercicio[];

  private constructor(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    ejercicios: Ejercicio[];
  }) {
    if (!props.nombre) throw new Error('El nombre de la rutina es requerido.');
    if (props.ejercicios.length === 0)
      throw new Error('Una rutina debe tener al menos un ejercicio.');

    this.id = props.id;
    this.nombre = props.nombre;
    this.nivel = props.nivel;
    this.coachId = props.coachId;
    this.sportId = props.sportId;
    this.ejercicios = props.ejercicios;
  }

  public static crear(props: {
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    ejercicios: {
      exerciseId: string;
      setsReps: string;
      duracionEstimadaSegundos?: number;
    }[];
  }): Rutina {
    // --- CORRECCIÓN AQUÍ: El mapeo ahora es completo y correcto ---
    const ejerciciosEntidad = props.ejercicios.map((e) =>
      Ejercicio.desdePersistencia({
        id: e.exerciseId,
        nombre: '', // El nombre se obtendrá de la BD, aquí no es necesario
        setsReps: e.setsReps,
        descripcion: null,
        duracionEstimadaSegundos: e.duracionEstimadaSegundos ?? 0,
      }),
    );

    return new Rutina({
      id: randomUUID(),
      nombre: props.nombre,
      nivel: props.nivel,
      coachId: props.coachId,
      sportId: props.sportId,
      ejercicios: ejerciciosEntidad,
    });
  }

  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    ejercicios: Ejercicio[];
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
