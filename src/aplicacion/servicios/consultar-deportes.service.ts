import { Inject, Injectable } from '@nestjs/common';
import { IDeporteRepositorio } from '../../dominio/repositorios/deporte.repositorio';

@Injectable()
export class ConsultarDeportesService {
  constructor(
    @Inject('IDeporteRepositorio')
    private readonly deporteRepositorio: IDeporteRepositorio,
  ) {}

  async ejecutar(): Promise<{
    id: number;
    nombre: string;
    descripcion?: string;
  }[]> {
    const deportes = await this.deporteRepositorio.encontrarTodos();

    return deportes.map((deporte) => ({
      id: deporte.id,
      nombre: deporte.nombre,
      descripcion: deporte.descripcion,
    }));
  }
}