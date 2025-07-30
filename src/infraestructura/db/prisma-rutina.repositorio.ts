import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  Routine,
  RoutineExercise,
  Exercise as PrismaExercise,
} from '@prisma/client';

import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { Rutina, EjercicioEnRutina } from '../../dominio/entidades/rutina.entity';

@Injectable()
export class PrismaRutinaRepositorio implements IRutinaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(rutina: Rutina): Promise<Rutina> {
    try {
      console.log('🚀 [PrismaRutinaRepositorio] Iniciando guardado de rutina:', rutina.nombre);
      console.log('📊 [PrismaRutinaRepositorio] Ejercicios a conectar:', rutina.ejercicios.length);

      // Verificar que todos los ejercicios existan antes de crear la rutina
      for (const ejercicio of rutina.ejercicios) {
        console.log(`🔍 [PrismaRutinaRepositorio] Verificando ejercicio: ${ejercicio.id}`);
        const ejercicioExiste = await this.prisma.exercise.findUnique({
          where: { id: ejercicio.id }
        });
        
        if (!ejercicioExiste) {
          throw new Error(`Ejercicio con ID ${ejercicio.id} no existe en la base de datos`);
        }
        console.log(`✅ [PrismaRutinaRepositorio] Ejercicio encontrado: ${ejercicioExiste.name}`);
      }

      console.log('💾 [PrismaRutinaRepositorio] Creando rutina en base de datos');

      let rutinaGuardadaDb;

      try {
        // INTENTO 1: Crear con clave UUID (nuevo esquema)
        console.log('💾 [PrismaRutinaRepositorio] Intentando crear con esquema nuevo (UUID)');
        rutinaGuardadaDb = await this.prisma.routine.create({
          data: {
            id: rutina.id,
            name: rutina.nombre,
            targetLevel: rutina.nivel,
            coachId: rutina.coachId,
            sportId: rutina.sportId,
            description: rutina.descripcion,
            exercises: {
              create: rutina.ejercicios.map((ejercicio, index) => {
                console.log(`🔗 [PrismaRutinaRepositorio] Conectando ejercicio ${index + 1}: ${ejercicio.id}`);
                return {
                  orderIndex: index + 1,
                  setsReps: ejercicio.setsReps,
                  duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
                  exercise: {
                    connect: {
                      id: ejercicio.id,
                    },
                  },
                };
              }),
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
      } catch (createError) {
        console.warn('⚠️ [PrismaRutinaRepositorio] Error con esquema nuevo, intentando método alternativo');
        console.warn('📊 [PrismaRutinaRepositorio] Error detalle:', createError.message);

        // INTENTO 2: Crear rutina y ejercicios por separado (compatible con esquema viejo)
        console.log('💾 [PrismaRutinaRepositorio] Creando rutina sin ejercicios primero');
        
        rutinaGuardadaDb = await this.prisma.routine.create({
          data: {
            id: rutina.id,
            name: rutina.nombre,
            targetLevel: rutina.nivel,
            coachId: rutina.coachId,
            sportId: rutina.sportId,
            description: rutina.descripcion,
          },
        });

        console.log('💾 [PrismaRutinaRepositorio] Agregando ejercicios uno por uno');

        // Crear ejercicios de rutina uno por uno
        for (let index = 0; index < rutina.ejercicios.length; index++) {
          const ejercicio = rutina.ejercicios[index];
          console.log(`🔗 [PrismaRutinaRepositorio] Agregando ejercicio ${index + 1}: ${ejercicio.id}`);
          
          await this.prisma.routineExercise.create({
            data: {
              routineId: rutina.id,
              exerciseId: ejercicio.id,
              orderIndex: index + 1,
              setsReps: ejercicio.setsReps,
              duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
            },
          });
        }

        // Obtener la rutina completa con sus ejercicios
        rutinaGuardadaDb = await this.prisma.routine.findUnique({
          where: { id: rutina.id },
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        });
      }

      console.log('✅ [PrismaRutinaRepositorio] Rutina guardada exitosamente:', rutinaGuardadaDb.id);

      return this.mapearADominio(rutinaGuardadaDb);
    } catch (error) {
      console.error('❌ [PrismaRutinaRepositorio] Error guardando rutina:', error);
      console.error('📊 [PrismaRutinaRepositorio] Stack trace:', error.stack);
      
      // Re-lanzar con información más específica
      if (error.code === 'P2002') {
        throw new Error(`Error de duplicado en base de datos: ${error.message}`);
      } else if (error.code === 'P2025') {
        throw new Error(`Registro no encontrado: ${error.message}`);
      } else {
        throw new Error(`Error de base de datos guardando rutina: ${error.message}`);
      }
    }
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

  public async eliminar(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Primero eliminar las relaciones de ejercicios
      await tx.routineExercise.deleteMany({
        where: { routineId: id },
      });

      // Luego eliminar las asignaciones relacionadas
      await tx.athleteAssignment.deleteMany({
        where: { routineId: id },
      });

      // Finalmente eliminar la rutina
      await tx.routine.delete({
        where: { id },
      });
    });
  }

  public async actualizar(id: string, datosActualizacion: {
    nombre?: string;
    nivel?: string;
    descripcion?: string;
    ejercicios?: {
      exerciseId: string;
      setsReps: string;
      duracionEstimadaSegundos?: number;
    }[];
  }): Promise<Rutina> {
    const rutinaActualizada = await this.prisma.$transaction(async (tx) => {
      // Actualizar datos básicos de la rutina
      const rutina = await tx.routine.update({
        where: { id },
        data: {
          name: datosActualizacion.nombre,
          targetLevel: datosActualizacion.nivel,
          description: datosActualizacion.descripcion,
        },
      });

      // Si se proporcionan ejercicios, actualizar la lista completa
      if (datosActualizacion.ejercicios) {
        // Eliminar ejercicios existentes
        await tx.routineExercise.deleteMany({
          where: { routineId: id },
        });

        // Crear nuevos ejercicios
        await tx.routineExercise.createMany({
          data: datosActualizacion.ejercicios.map((ejercicio, index) => ({
            routineId: id,
            exerciseId: ejercicio.exerciseId,
            orderIndex: index + 1,
            setsReps: ejercicio.setsReps,
            duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
          })),
        });
      }

      // Obtener la rutina actualizada con sus relaciones
      return await tx.routine.findUnique({
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
    });

    if (!rutinaActualizada) {
      throw new Error('Rutina no encontrada después de la actualización');
    }

    return this.mapearADominio(rutinaActualizada);
  }

  private mapearADominio(
    rutinaDb: Routine & {
      exercises: (RoutineExercise & { exercise: PrismaExercise })[];
    },
  ): Rutina {
    const ejerciciosMapeados: EjercicioEnRutina[] = rutinaDb.exercises.map((e) => ({
      id: e.exercise.id,
      nombre: e.exercise.name,
      descripcion: e.exercise.description,
      setsReps: e.setsReps || '',
      duracionEstimadaSegundos: e.duracionEstimadaSegundos ?? 0,
    }));

    return Rutina.desdePersistencia({
      id: rutinaDb.id,
      nombre: rutinaDb.name,
      nivel: rutinaDb.targetLevel,
      coachId: rutinaDb.coachId,
      sportId: rutinaDb.sportId,
      descripcion: rutinaDb.description,
      ejercicios: ejerciciosMapeados,
    });
  }
}
