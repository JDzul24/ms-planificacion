import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { ActualizarEstadoAsignacionDto } from '../../infraestructura/dtos/actualizar-estado-asignacion.dto';

@Injectable()
export class ActualizarEstadoAsignacionService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
  ) {}

  async ejecutar(
    asignacionId: string,
    dto: ActualizarEstadoAsignacionDto,
    usuarioId: string,
    rolUsuario: string,
  ): Promise<{
    id: string;
    estado: string;
    mensaje: string;
  }> {
    // Verificar que la asignación existe
    const asignacion = await this.asignacionRepositorio.encontrarPorId(asignacionId);
    if (!asignacion) {
      throw new NotFoundException('La asignación especificada no existe.');
    }

    // Verificar permisos:
    // - Los atletas solo pueden actualizar sus propias asignaciones
    // - Los entrenadores pueden actualizar asignaciones que ellos crearon
    let tienePermisos = false;

    if (rolUsuario === 'Atleta') {
      tienePermisos = asignacion.atletaId === usuarioId;
    } else if (rolUsuario === 'Entrenador') {
      tienePermisos = await this.asignacionRepositorio.validarPropietario(
        asignacionId,
        usuarioId,
      );
    }

    if (!tienePermisos) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar esta asignación.',
      );
    }

    // Actualizar el estado
    const asignacionActualizada = await this.asignacionRepositorio.actualizarEstado(
      asignacionId,
      dto.estado,
    );

    return {
      id: asignacionActualizada.id,
      estado: asignacionActualizada.status,
      mensaje: `Estado de asignación actualizado a ${dto.estado}.`,
    };
  }
}