import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { RutinaDetallesDto } from '../../infraestructura/dtos/rutina-detalles.dto';
import { EjercicioDetalleDto } from '../../infraestructura/dtos/ejercicio-detalle.dto';

@Injectable()
export class ConsultarDetallesRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  /**
   * Ejecuta la lógica para obtener los detalles completos de una rutina específica.
   * @param id El UUID de la rutina a consultar.
   * @returns Un DTO con los detalles completos de la rutina.
   * @throws NotFoundException si no se encuentra una rutina con el ID proporcionado.
   */
  async ejecutar(id: string): Promise<RutinaDetallesDto> {
    const rutina = await this.rutinaRepositorio.encontrarPorId(id);

    if (!rutina) {
      throw new NotFoundException(`No se encontró una rutina con el ID ${id}.`);
    }

    // Mapeamos la entidad de dominio y sus ejercicios a un DTO de respuesta detallado.
    // Esto asegura que la estructura de la respuesta sea consistente y desacoplada
    // de la estructura interna de nuestras entidades de dominio.
    const ejerciciosDto: EjercicioDetalleDto[] = rutina.ejercicios.map(
      (ejercicio) => ({
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        setsReps: ejercicio.setsReps,
      }),
    );

    const rutinaDetallesDto: RutinaDetallesDto = {
      id: rutina.id,
      nombre: rutina.nombre,
      nivel: rutina.nivel,
      ejercicios: ejerciciosDto,
    };

    return rutinaDetallesDto;
  }
}
