import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Goal as PrismaMeta } from '@prisma/client';

import { IMetaRepositorio } from '../../dominio/repositorios/meta.repositorio';
import { Meta } from '../../dominio/entidades/meta.entity';

@Injectable()
export class PrismaMetaRepositorio implements IMetaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(meta: Meta): Promise<Meta> {
    const metaDb = await this.prisma.goal.create({
      data: {
        id: meta.id,
        creatorId: meta.creadorId,
        description: meta.descripcion,
        dueDate: meta.fechaLimite,
      },
    });

    return this.mapearADominio(metaDb);
  }

  public async encontrarPorCreador(creadorId: string): Promise<Meta[]> {
    const metasDb = await this.prisma.goal.findMany({
      where: { creatorId: creadorId },
      orderBy: { dueDate: 'asc' },
    });

    return metasDb.map((metaDb) => this.mapearADominio(metaDb));
  }

  public async encontrarPorId(id: string): Promise<Meta | null> {
    const metaDb = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!metaDb) {
      return null;
    }

    return this.mapearADominio(metaDb);
  }

  public async actualizar(id: string, datosActualizacion: {
    descripcion?: string;
    fechaLimite?: Date;
  }): Promise<Meta> {
    const metaActualizada = await this.prisma.goal.update({
      where: { id },
      data: {
        description: datosActualizacion.descripcion,
        dueDate: datosActualizacion.fechaLimite,
      },
    });

    return this.mapearADominio(metaActualizada);
  }

  public async eliminar(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Eliminar asignaciones relacionadas
      await tx.athleteAssignment.deleteMany({
        where: { goalId: id },
      });

      // Eliminar la meta
      await tx.goal.delete({
        where: { id },
      });
    });
  }

  public async validarPropietario(metaId: string, creadorId: string): Promise<boolean> {
    const count = await this.prisma.goal.count({
      where: {
        id: metaId,
        creatorId: creadorId,
      },
    });
    return count > 0;
  }

  private mapearADominio(metaDb: PrismaMeta): Meta {
    return Meta.desdePersistencia({
      id: metaDb.id,
      creadorId: metaDb.creatorId,
      descripcion: metaDb.description,
      fechaLimite: metaDb.dueDate,
      createdAt: new Date(), // El modelo Goal no tiene createdAt, usar fecha actual
    });
  }
}