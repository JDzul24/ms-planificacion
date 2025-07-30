import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AthleteAssignment as PrismaAsignacion } from '@prisma/client';

import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { Asignacion } from '../../dominio/entidades/asignacion.entity';

@Injectable()
export class PrismaAsignacionRepositorio implements IAsignacionRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardarMultiples(asignaciones: Asignacion[]): Promise<void> {
    const datosParaCrear = asignaciones.map((asignacion) => ({
      id: asignacion.id,
      athleteId: asignacion.atletaId,
      assignerId: asignacion.assignerId,
      routineId: asignacion.rutinaId,
      goalId: asignacion.metaId,
      status: asignacion.status,
      assignedAt: asignacion.assignedAt,
    }));

    await this.prisma.athleteAssignment.createMany({
      data: datosParaCrear,
      skipDuplicates: true,
    });
  }

  public async encontrarPorAtletaId(atletaId: string): Promise<Asignacion[]> {
    const asignacionesDb = await this.prisma.athleteAssignment.findMany({
      where: {
        athleteId: atletaId,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return asignacionesDb.map((asignacionDb) =>
      this.mapearADominio(asignacionDb),
    );
  }

  public async encontrarPorId(id: string): Promise<Asignacion | null> {
    const asignacionDb = await this.prisma.athleteAssignment.findUnique({
      where: { id },
    });

    if (!asignacionDb) {
      return null;
    }

    return this.mapearADominio(asignacionDb);
  }

  public async eliminar(id: string): Promise<void> {
    await this.prisma.athleteAssignment.delete({
      where: { id },
    });
  }

  public async actualizarEstado(
    id: string,
    nuevoEstado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA',
  ): Promise<Asignacion> {
    const asignacionActualizada = await this.prisma.athleteAssignment.update({
      where: { id },
      data: { status: nuevoEstado },
    });

    return this.mapearADominio(asignacionActualizada);
  }

  public async validarPropietario(
    asignacionId: string,
    entrenadorId: string,
  ): Promise<boolean> {
    const count = await this.prisma.athleteAssignment.count({
      where: {
        id: asignacionId,
        assignerId: entrenadorId,
      },
    });
    return count > 0;
  }

  private mapearADominio(persistencia: PrismaAsignacion): Asignacion {
    return Asignacion.desdePersistencia({
      id: persistencia.id,
      atletaId: persistencia.athleteId,
      assignerId: persistencia.assignerId,
      rutinaId: persistencia.routineId ?? undefined,
      metaId: persistencia.goalId ?? undefined,
      status: persistencia.status as 'PENDIENTE' | 'COMPLETADA' | 'EN_PROGRESO',
      assignedAt: persistencia.assignedAt,
    });
  }
}
