import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Sport as PrismaDeporte } from '@prisma/client';

import { IDeporteRepositorio } from '../../dominio/repositorios/deporte.repositorio';
import { Deporte } from '../../dominio/entidades/deporte.entity';

@Injectable()
export class PrismaDeporteRepositorio implements IDeporteRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(deporte: Deporte): Promise<Deporte> {
    const deporteDb = await this.prisma.sport.create({
      data: {
        name: deporte.nombre,
        description: deporte.descripcion,
      },
    });

    return this.mapearADominio(deporteDb);
  }

  public async encontrarTodos(): Promise<Deporte[]> {
    const deportesDb = await this.prisma.sport.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return deportesDb.map((deporteDb) => this.mapearADominio(deporteDb));
  }

  public async encontrarPorId(id: number): Promise<Deporte | null> {
    const deporteDb = await this.prisma.sport.findUnique({
      where: { id },
    });

    if (!deporteDb) {
      return null;
    }

    return this.mapearADominio(deporteDb);
  }

  public async actualizar(id: number, datosActualizacion: {
    nombre?: string;
    descripcion?: string;
  }): Promise<Deporte> {
    const deporteActualizado = await this.prisma.sport.update({
      where: { id },
      data: {
        name: datosActualizacion.nombre,
        description: datosActualizacion.descripcion,
      },
    });

    return this.mapearADominio(deporteActualizado);
  }

  public async eliminar(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Verificar si hay rutinas asociadas
      const rutinasCount = await tx.routine.count({
        where: { sportId: id },
      });

      if (rutinasCount > 0) {
        throw new Error(
          'No se puede eliminar el deporte porque tiene rutinas asociadas.',
        );
      }

      // Verificar si hay ejercicios asociados
      const ejerciciosCount = await tx.exercise.count({
        where: { sportId: id },
      });

      if (ejerciciosCount > 0) {
        throw new Error(
          'No se puede eliminar el deporte porque tiene ejercicios asociados.',
        );
      }

      // Eliminar el deporte
      await tx.sport.delete({
        where: { id },
      });
    });
  }

  public async existeNombre(nombre: string, idExcluir?: number): Promise<boolean> {
    const count = await this.prisma.sport.count({
      where: {
        name: {
          equals: nombre,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
        id: idExcluir ? { not: idExcluir } : undefined,
      },
    });

    return count > 0;
  }

  private mapearADominio(deporteDb: PrismaDeporte): Deporte {
    return Deporte.desdePersistencia({
      id: deporteDb.id,
      nombre: deporteDb.name,
      descripcion: deporteDb.description,
    });
  }
}