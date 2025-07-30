import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IMetaRepositorio } from '../../dominio/repositorios/meta.repositorio';
import { ActualizarMetaDto } from '../../infraestructura/dtos/actualizar-meta.dto';

@Injectable()
export class ActualizarMetaService {
  constructor(
    @Inject('IMetaRepositorio')
    private readonly metaRepositorio: IMetaRepositorio,
  ) {}

  async ejecutar(
    metaId: string,
    dto: ActualizarMetaDto,
    creadorId: string,
  ): Promise<{
    id: string;
    descripcion: string;
    fechaLimite?: string;
  }> {
    // Verificar que la meta existe
    const metaExistente = await this.metaRepositorio.encontrarPorId(metaId);
    if (!metaExistente) {
      throw new NotFoundException('La meta especificada no existe.');
    }

    // Verificar que el usuario tiene permisos para actualizar esta meta
    const esPropietario = await this.metaRepositorio.validarPropietario(
      metaId,
      creadorId,
    );

    if (!esPropietario) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar esta meta.',
      );
    }

    // Actualizar la meta
    const metaActualizada = await this.metaRepositorio.actualizar(metaId, {
      descripcion: dto.descripcion,
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
    });

    return {
      id: metaActualizada.id,
      descripcion: metaActualizada.descripcion,
      fechaLimite: metaActualizada.fechaLimite?.toISOString(),
    };
  }
}