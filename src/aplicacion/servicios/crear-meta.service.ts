import { Inject, Injectable } from '@nestjs/common';
import { IMetaRepositorio } from '../../dominio/repositorios/meta.repositorio';
import { Meta } from '../../dominio/entidades/meta.entity';
import { CrearMetaDto } from '../../infraestructura/dtos/crear-meta.dto';

@Injectable()
export class CrearMetaService {
  constructor(
    @Inject('IMetaRepositorio')
    private readonly metaRepositorio: IMetaRepositorio,
  ) {}

  async ejecutar(dto: CrearMetaDto, creadorId: string): Promise<{
    id: string;
    descripcion: string;
    fechaLimite?: string;
    createdAt: string;
  }> {
    // Crear la nueva meta
    const nuevaMeta = Meta.crear({
      creadorId,
      descripcion: dto.descripcion,
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
    });

    const metaGuardada = await this.metaRepositorio.guardar(nuevaMeta);

    return {
      id: metaGuardada.id,
      descripcion: metaGuardada.descripcion,
      fechaLimite: metaGuardada.fechaLimite?.toISOString(),
      createdAt: metaGuardada.createdAt.toISOString(),
    };
  }
}