import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';

@Injectable()
export class EliminarRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  async ejecutar(rutinaId: string, coachId: string): Promise<{ mensaje: string }> {
    // Verificar que la rutina existe y pertenece al coach
    const esValida = await this.rutinaRepositorio.validarExistenciaYPropietario(
      rutinaId,
      coachId,
    );

    if (!esValida) {
      // Verificar si la rutina existe para dar un mensaje más específico
      const rutina = await this.rutinaRepositorio.encontrarPorId(rutinaId);
      if (!rutina) {
        throw new NotFoundException('La rutina especificada no existe.');
      } else {
        throw new ForbiddenException(
          'No tienes permisos para eliminar esta rutina.',
        );
      }
    }

    // Eliminar la rutina y todas sus relaciones
    await this.rutinaRepositorio.eliminar(rutinaId);

    return {
      mensaje: 'Rutina eliminada exitosamente.',
    };
  }
}