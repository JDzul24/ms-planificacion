import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IDeporteRepositorio } from '../../dominio/repositorios/deporte.repositorio';
import { ActualizarDeporteDto } from '../../infraestructura/dtos/actualizar-deporte.dto';

@Injectable()
export class ActualizarDeporteService {
  constructor(
    @Inject('IDeporteRepositorio')
    private readonly deporteRepositorio: IDeporteRepositorio,
  ) {}

  async ejecutar(id: number, dto: ActualizarDeporteDto): Promise<{
    id: number;
    nombre: string;
    descripcion?: string;
  }> {
    // Verificar que el deporte existe
    const deporteExistente = await this.deporteRepositorio.encontrarPorId(id);
    if (!deporteExistente) {
      throw new NotFoundException('El deporte especificado no existe.');
    }

    // Si se está actualizando el nombre, verificar que no exista otro deporte con ese nombre
    if (dto.nombre) {
      const existeNombre = await this.deporteRepositorio.existeNombre(dto.nombre, id);
      if (existeNombre) {
        throw new ConflictException(
          `Ya existe otro deporte con el nombre "${dto.nombre}".`,
        );
      }
    }

    // Actualizar el deporte
    const deporteActualizado = await this.deporteRepositorio.actualizar(id, {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });

    return {
      id: deporteActualizado.id,
      nombre: deporteActualizado.nombre,
      descripcion: deporteActualizado.descripcion,
    };
  }
}