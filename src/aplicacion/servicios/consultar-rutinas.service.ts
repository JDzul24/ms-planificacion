import { Inject, Injectable } from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { RutinaResumenDto } from '../../infraestructura/dtos/rutina-resumen.dto';

@Injectable()
export class ConsultarRutinasService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  /**
   * Ejecuta la lógica para consultar y devolver una lista de rutinas.
   * @param filtros Objeto con los filtros a aplicar, como el nivel.
   * @returns Un arreglo de DTOs con el resumen de cada rutina.
   */
  async ejecutar(filtros?: { nivel?: string }): Promise<RutinaResumenDto[]> {
    const rutinas = await this.rutinaRepositorio.encontrar(filtros);

    // Mapeamos las entidades de dominio completas a un DTO de resumen.
    // Esto evita enviar información innecesaria (como la lista detallada de ejercicios)
    // en una vista de listado.
    return rutinas.map((rutina) => ({
      id: rutina.id,
      nombre: rutina.nombre,
      nivel: rutina.nivel,
      cantidadEjercicios: rutina.ejercicios.length,
      // Aquí se podría añadir más información de resumen, como una duración estimada.
    }));
  }
}
