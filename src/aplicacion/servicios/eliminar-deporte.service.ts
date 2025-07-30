import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IDeporteRepositorio } from '../../dominio/repositorios/deporte.repositorio';

@Injectable()
export class EliminarDeporteService {
  constructor(
    @Inject('IDeporteRepositorio')
    private readonly deporteRepositorio: IDeporteRepositorio,
  ) {}

  async ejecutar(id: number): Promise<{ mensaje: string }> {
    // Verificar que el deporte existe
    const deporteExistente = await this.deporteRepositorio.encontrarPorId(id);
    if (!deporteExistente) {
      throw new NotFoundException('El deporte especificado no existe.');
    }

    try {
      // Intentar eliminar el deporte
      await this.deporteRepositorio.eliminar(id);

      return {
        mensaje: 'Deporte eliminado exitosamente.',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ConflictException(error.message);
      }
      throw new ConflictException(
        'No se puede eliminar el deporte porque tiene datos asociados.',
      );
    }
  }
}