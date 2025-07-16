import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  Routine,
  RoutineExercise,
  Exercise as PrismaExercise,
} from '@prisma/client';

import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { Rutina } from '../../dominio/entidades/rutina.entity';
import { Ejercicio } from '../../dominio/entidades/ejercicio.entity';

@Injectable()
export class PrismaRutinaRepositorio implements IRutinaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(rutina: Rutina): Promise<Rutina> {
    const rutinaGuardadaDb = await this.prisma.routine.create({
      data: {
        id: rutina.id,
        name: rutina.nombre,
        targetLevel: rutina.nivel,
        coachId: rutina.coachId,
        sportId: rutina.sportId,
        exercises: {
          create: rutina.ejercicios.map((ejercicio, index) => ({
            orderIndex: index + 1,
            setsReps: ejercicio.setsReps,
            exercise: {
              connect: {
                id: ejercicio.id,
              },
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return this.mapearADominio(rutinaGuardadaDb);
  }

  public async encontrar(filtros?: { nivel?: string }): Promise<Rutina[]> {
    const rutinasDb = await this.prisma.routine.findMany({
      where: {
        targetLevel: filtros?.nivel,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return rutinasDb.map((rutinaDb) => this.mapearADominio(rutinaDb));
  }

  /**
   * Implementación del método para encontrar una única rutina por su ID.
   */
  public async encontrarPorId(id: string): Promise<Rutina | null> {
    const rutinaDb = await this.prisma.routine.findUnique({
      where: { id },
      include: {
        // Incluimos la tabla de unión y, dentro de ella, el ejercicio relacionado
        // para obtener todos los detalles necesarios en una sola consulta.
        exercises: {
          orderBy: {
            orderIndex: 'asc', // Aseguramos que los ejercicios vengan en orden
          },
          include: {
            exercise: true, // Hacemos el JOIN a la tabla 'exercises'
          },
        },
      },
    });

    if (!rutinaDb) {
      return null;
    }

    return this.mapearADominio(rutinaDb);
  }

  /**
   * Mapea un objeto de rutina de la base de datos a una entidad de dominio.
   */
  private mapearADominio(
    rutinaDb: Routine & {
      exercises: (RoutineExercise & { exercise: PrismaExercise })[];
    },
  ): Rutina {
    const ejerciciosMapeados = rutinaDb.exercises.map((e) =>
      Ejercicio.desdePersistencia({
        id: e.exercise.id,
        nombre: e.exercise.name, // Ahora tenemos el nombre real del ejercicio
        setsReps: e.setsReps,
      }),
    );

    return Rutina.desdePersistencia({
      id: rutinaDb.id,
      nombre: rutinaDb.name,
      nivel: rutinaDb.targetLevel,
      coachId: rutinaDb.coachId,
      sportId: rutinaDb.sportId,
      ejercicios: ejerciciosMapeados,
    });
  }
}
