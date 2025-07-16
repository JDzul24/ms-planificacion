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
    if (!props.ejercicios || props.ejercicios.length === 0) {
      throw new Error('Una rutina debe tener al menos un ejercicio.');
    }

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
    ejercicios: { exerciseId: string; setsReps: string | null }[];
  }): Rutina {
    // El método 'crear' recibe los datos crudos y los convierte en entidades Ejercicio.
    const ejerciciosEntidad = props.ejercicios.map((e) =>
      Ejercicio.desdePersistencia({
        id: e.exerciseId,
        nombre: '', // El nombre se obtendrá de la BD, aquí no es necesario
        setsReps: e.setsReps,
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

  /**
   * --- MÉTODO AÑADIDO ---
   * Método estático para reconstituir una entidad Rutina desde los datos
   * que vienen de la capa de persistencia (base de datos).
   */
  public static desdePersistencia(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    ejercicios: Ejercicio[];
  }): Rutina {
    // Reutilizamos el constructor privado para crear la instancia.
    return new Rutina(props);
  }
}
