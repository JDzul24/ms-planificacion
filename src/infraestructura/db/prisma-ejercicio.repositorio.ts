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
