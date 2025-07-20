import { Inject, Injectable } from '@nestjs/common';
import { IEjercicioRepositorio } from '../../dominio/repositorios/ejercicio.repositorio';
import { EjercicioResumenDto } from '../../infraestructura/dtos/ejercicio-resumen.dto';

@Injectable()
export class ConsultarEjerciciosService {
  constructor(
    @Inject('IEjercicioRepositorio')
    private readonly ejercicioRepositorio: IEjercicioRepositorio,
  ) {}

  /**
   * Ejecuta la lógica para consultar y devolver una lista de ejercicios.
   * @param filtros Un objeto opcional con los criterios de búsqueda, como el ID de deporte.
   * @returns Una promesa que resuelve a un arreglo de DTOs con el resumen de cada ejercicio.
   */
  async ejecutar(filtros?: {
    sportId?: number;
  }): Promise<EjercicioResumenDto[]> {
    const ejercicios = await this.ejercicioRepositorio.encontrar(filtros);

    // Mapeamos las entidades de dominio a DTOs de resumen, exponiendo solo lo necesario.
    return ejercicios.map((ejercicio) => ({
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      descripcion: ejercicio.descripcion,
      // setsReps no se incluye aquí ya que es más específico de una rutina.
    }));
  }
}
