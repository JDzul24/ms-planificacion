import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Exercise as PrismaExercise } from '@prisma/client'; // Renombrado para evitar conflicto con la entidad de dominio

import { IEjercicioRepositorio } from '../../dominio/repositorios/ejercicio.repositorio';
import { Ejercicio } from '../../dominio/entidades/ejercicio.entity';

@Injectable()
export class PrismaEjercicioRepositorio implements IEjercicioRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Implementación del método para encontrar ejercicios, con filtrado opcional por ID de deporte.
   * @param filtros Objeto opcional que puede contener un `sportId`.
   * @returns Una promesa que resuelve a un arreglo de entidades `Ejercicio`.
   */
  public async encontrar(filtros?: { sportId?: number }): Promise<Ejercicio[]> {
    const ejerciciosDb = await this.prisma.exercise.findMany({
      where: {
        // Aplica el filtro `sportId` solo si se proporciona en el objeto `filtros`.
        sportId: filtros?.sportId,
      },
      orderBy: {
        name: 'asc', // Ordenar por nombre para resultados consistentes.
      },
    });

    // Mapeamos los resultados de la base de datos a nuestras entidades de dominio.
    return ejerciciosDb.map((ejercicioDb) => this.mapearADominio(ejercicioDb));
  }

  /**
   * Busca un ejercicio por su ID.
   * @param id El ID del ejercicio a buscar.
   * @returns Una promesa que resuelve a una entidad Ejercicio o null si no existe.
   */
  public async encontrarPorId(id: string): Promise<Ejercicio | null> {
    const ejercicioDb = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!ejercicioDb) {
      return null;
    }

    return this.mapearADominio(ejercicioDb);
  }

  /**
   * Guarda un ejercicio en la base de datos usando upsert (crear o actualizar).
   * @param ejercicio La entidad Ejercicio a guardar.
   * @param categoria La categoría del ejercicio.
   * @param sportId El ID del deporte al que pertenece.
   * @returns Una promesa que resuelve a la entidad Ejercicio guardada.
   */
  public async guardar(ejercicio: Ejercicio, categoria = 'resistencia', sportId = 1): Promise<Ejercicio> {
    try {
      console.log('📥 [PrismaEjercicioRepositorio] Guardando ejercicio:', ejercicio.nombre);
      console.log('📥 [PrismaEjercicioRepositorio] Categoría recibida:', categoria);
      
      // Validar la categoría para diagnóstico
      console.log('🔍 [PrismaEjercicioRepositorio] Validando categoría:', categoria);
      console.log('🔍 [PrismaEjercicioRepositorio] ¿Es resistencia?', categoria === 'resistencia');
      console.log('🔍 [PrismaEjercicioRepositorio] Tipo de dato:', typeof categoria);
      
      if (!categoria || !['calentamiento', 'resistencia', 'tecnica'].includes(categoria)) {
        console.warn('⚠️ [PrismaEjercicioRepositorio] Categoría inválida, usando default:', categoria);
        categoria = 'resistencia';
      } else {
        console.log('✅ [PrismaEjercicioRepositorio] Categoría validada:', categoria);
      }
      
      // Verificación adicional después de la validación
      if (categoria === 'resistencia') {
        console.log('🎯 [PrismaEjercicioRepositorio] Categoría RESISTENCIA confirmada');
      }

      // Intentar upsert con categoria (para bases de datos actualizadas)
      const ejercicioDb = await this.prisma.exercise.upsert({
        where: { id: ejercicio.id },
        create: {
          id: ejercicio.id,
          name: ejercicio.nombre,
          description: ejercicio.descripcion,
          categoria: categoria,
          sportId: sportId,
        },
        update: {
          name: ejercicio.nombre,
          description: ejercicio.descripcion,
          categoria: categoria,
          sportId: sportId,
        },
      });
      
      console.log('✅ [PrismaEjercicioRepositorio] Ejercicio guardado con categoría:', ejercicioDb.categoria);
      
      // Verificación final después de guardar
      if (categoria === 'resistencia' && ejercicioDb.categoria !== 'resistencia') {
        console.error('❌❌ [PrismaEjercicioRepositorio] ERROR: La categoría resistencia no se guardó correctamente!');
        console.error('❌❌ [PrismaEjercicioRepositorio] Esperado: resistencia, Actual:', ejercicioDb.categoria);
      } else if (categoria === 'resistencia') {
        console.log('✅✅ [PrismaEjercicioRepositorio] Categoría resistencia guardada correctamente!');
      }

      return this.mapearADominio(ejercicioDb);
    } catch (error) {
      // Si falla por columna categoria inexistente, intentar sin categoria
      if (error.code === 'P2022' && error.meta?.column === 'categoria') {
        console.warn('⚠️ [PrismaEjercicioRepositorio] Columna categoria no existe en BD, creando ejercicio sin categoria');
        console.error('❌ [PrismaEjercicioRepositorio] Error original:', error.message);
        
        const ejercicioDb = await this.prisma.exercise.upsert({
          where: { id: ejercicio.id },
          create: {
            id: ejercicio.id,
            name: ejercicio.nombre,
            description: ejercicio.descripcion,
            sportId: sportId,
          },
          update: {
            name: ejercicio.nombre,
            description: ejercicio.descripcion,
            sportId: sportId,
          },
        });

        console.log('✅ [PrismaEjercicioRepositorio] Ejercicio guardado sin campo categoria:', ejercicioDb.name);
        return this.mapearADominio(ejercicioDb);
      }
      
      // Si falla por foreign key de sportId (deporte no existe)
      if (error.code === 'P2003' && error.meta?.constraint === 'exercises_sportId_fkey') {
        console.error('❌ [PrismaEjercicioRepositorio] Deporte no existe en BD:', sportId);
        throw new Error(`El deporte con ID ${sportId} no existe en la base de datos. Debe crearse primero.`);
      }
      
      // Re-lanzar cualquier otro error
      throw error;
    }
  }

  /**
   * Mapea un objeto de ejercicio de la base de datos (Prisma) a una entidad de dominio `Ejercicio`.
   * @param ejercicioDb El objeto `PrismaExercise` recuperado de la base de datos.
   * @returns Una instancia de la entidad de dominio `Ejercicio`.
   */
  private mapearADominio(ejercicioDb: PrismaExercise): Ejercicio {
    return Ejercicio.desdePersistencia({
      id: ejercicioDb.id,
      nombre: ejercicioDb.name,
      descripcion: ejercicioDb.description,
      setsReps: null,
      duracionEstimadaSegundos: 0,
    });
  }
}
