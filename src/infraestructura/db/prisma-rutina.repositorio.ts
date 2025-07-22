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
            duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
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

  /**
   * Implementación del método para encontrar rutinas con filtros opcionales por nivel y/o IDs.
   */
  public async encontrar(filtros?: {
    nivel?: string;
    ids?: string[];
  }): Promise<Rutina[]> {
    const rutinasDb = await this.prisma.routine.findMany({
      where: {
        targetLevel: filtros?.nivel,
        // Si se proporciona un arreglo de IDs, se añade la condición 'in' a la consulta.
        id: filtros?.ids ? { in: filtros.ids } : undefined,
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

  public async encontrarPorId(id: string): Promise<Rutina | null> {
    const rutinaDb = await this.prisma.routine.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!rutinaDb) {
      return null;
    }

    return this.mapearADominio(rutinaDb);
  }

  public async validarExistenciaYPropietario(
    rutinaId: string,
    coachId: string,
  ): Promise<boolean> {
    const count = await this.prisma.routine.count({
      where: {
        id: rutinaId,
        coachId: coachId,
      },
    });
    return count > 0;
  }

  private mapearADominio(
    rutinaDb: Routine & {
      exercises: (RoutineExercise & { exercise: PrismaExercise })[];
    },
  ): Rutina {
    const ejerciciosMapeados = rutinaDb.exercises.map((e) =>
      Ejercicio.desdePersistencia({
        id: e.exercise.id,
        nombre: e.exercise.name,
        setsReps: e.setsReps,
        descripcion: e.exercise.description,
        duracionEstimadaSegundos: e.duracionEstimadaSegundos ?? 0,
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
