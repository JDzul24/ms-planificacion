import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IMetaRepositorio } from '../../dominio/repositorios/meta.repositorio';

@Injectable()
export class EliminarMetaService {
  constructor(
    @Inject('IMetaRepositorio')
    private readonly metaRepositorio: IMetaRepositorio,
  ) {}

  async ejecutar(metaId: string, creadorId: string): Promise<{ mensaje: string }> {
    // Verificar que la meta existe
    const metaExistente = await this.metaRepositorio.encontrarPorId(metaId);
    if (!metaExistente) {
      throw new NotFoundException('La meta especificada no existe.');
    }

    // Verificar que el usuario tiene permisos para eliminar esta meta
    const esPropietario = await this.metaRepositorio.validarPropietario(
      metaId,
      creadorId,
    );

    if (!esPropietario) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta meta.',
      );
    }

    // Eliminar la meta y todas sus asignaciones relacionadas
    await this.metaRepositorio.eliminar(metaId);

    return {
      mensaje: 'Meta eliminada exitosamente.',
    };
  }
}