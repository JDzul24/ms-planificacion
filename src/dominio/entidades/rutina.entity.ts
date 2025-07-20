import { randomUUID } from 'crypto';
import { Ejercicio } from './ejercicio.entity';

export class Rutina {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: string;
  readonly coachId: string;
  readonly sportId: number;
  public ejercicios: Ejercicio[]; // La lista de ejercicios que componen la rutina

  private constructor(props: {
    id: string;
    nombre: string;
    nivel: string;
    coachId: string;
    sportId: number;
    ejercicios: Ejercicio[];
  }) {
    // Validaciones de dominio
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
    ejercicios: { exerciseId: string; setsReps: string }[];
  }): Rutina {
    const ejerciciosEntidad = props.ejercicios.map((e) =>
      Ejercicio.desdePersistencia({
        id: e.exerciseId,
        nombre: '', // Proporcionamos un nombre vacío o un placeholder si no lo tenemos del DTO
        setsReps: e.setsReps,
        descripcion: null, // <-- CORRECCIÓN: Se añade la propiedad 'descripcion'
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
   * Método para reconstituir una entidad desde la base de datos.
   */
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
}
