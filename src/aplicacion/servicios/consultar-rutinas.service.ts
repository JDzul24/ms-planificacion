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
   * @param filtros Objeto opcional con los filtros a aplicar, como nivel o una lista de IDs.
   * @returns Un arreglo de DTOs con el resumen de cada rutina.
   */
  async ejecutar(filtros?: {
    nivel?: string;
    ids?: string[];
  }): Promise<RutinaResumenDto[]> {
    // Pasa el objeto de filtros directamente al repositorio.
    // El repositorio se encarga de construir la consulta correcta.
    const rutinas = await this.rutinaRepositorio.encontrar(filtros);

    // Mapeamos las entidades de dominio completas a un DTO de resumen enriquecido.
    return rutinas.map((rutina) => {
      const duracionSegundos = rutina.calcularDuracionEstimadaSegundos();
      const duracionMinutos = Math.ceil(duracionSegundos / 60);

      return {
        id: rutina.id,
        nombre: rutina.nombre,
        nivel: rutina.nivel,
        cantidadEjercicios: rutina.ejercicios.length,
        duracionEstimadaMinutos: duracionMinutos,
      };
    });
  }
}
