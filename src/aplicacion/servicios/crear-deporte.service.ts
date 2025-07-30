import {
  Inject,
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { IDeporteRepositorio } from '../../dominio/repositorios/deporte.repositorio';
import { Deporte } from '../../dominio/entidades/deporte.entity';
import { CrearDeporteDto } from '../../infraestructura/dtos/crear-deporte.dto';

@Injectable()
export class CrearDeporteService {
  constructor(
    @Inject('IDeporteRepositorio')
    private readonly deporteRepositorio: IDeporteRepositorio,
  ) {}

  async ejecutar(dto: CrearDeporteDto): Promise<{
    id: number;
    nombre: string;
    descripcion?: string;
  }> {
    // Verificar que no existe un deporte con el mismo nombre
    const existeNombre = await this.deporteRepositorio.existeNombre(dto.nombre);
    if (existeNombre) {
      throw new ConflictException(
        `Ya existe un deporte con el nombre "${dto.nombre}".`,
      );
    }

    // Crear el nuevo deporte
    const nuevoDeporte = Deporte.crear({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });

    const deporteGuardado = await this.deporteRepositorio.guardar(nuevoDeporte);

    return {
      id: deporteGuardado.id,
      nombre: deporteGuardado.nombre,
      descripcion: deporteGuardado.descripcion,
    };
  }
}