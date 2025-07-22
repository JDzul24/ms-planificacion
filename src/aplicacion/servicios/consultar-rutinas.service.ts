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

    // Mapeamos las entidades de dominio completas a un DTO de resumen enriquecido.
    return rutinas.map((rutina) => {
      // Invocamos el método de lógica de negocio de la entidad de dominio.
      const duracionSegundos = rutina.calcularDuracionEstimadaSegundos();
      // Realizamos la conversión a minutos para el DTO.
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
