import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';

@Injectable()
export class EliminarAsignacionService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
  ) {}

  async ejecutar(
    asignacionId: string,
    entrenadorId: string,
  ): Promise<{ mensaje: string }> {
    // Verificar que la asignación existe
    const asignacion = await this.asignacionRepositorio.encontrarPorId(asignacionId);
    if (!asignacion) {
      throw new NotFoundException('La asignación especificada no existe.');
    }

    // Verificar que el entrenador tiene permisos para eliminar esta asignación
    const esPropietario = await this.asignacionRepositorio.validarPropietario(
      asignacionId,
      entrenadorId,
    );

    if (!esPropietario) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta asignación.',
      );
    }

    // Eliminar la asignación
    await this.asignacionRepositorio.eliminar(asignacionId);

    return {
      mensaje: 'Asignación eliminada exitosamente.',
    };
  }
}