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
    console.log('🔍 [ConsultarDetallesRutinaService] Buscando rutina con ID:', id);
    
    const rutina = await this.rutinaRepositorio.encontrarPorId(id);

    if (!rutina) {
      console.log('❌ [ConsultarDetallesRutinaService] Rutina no encontrada con ID:', id);
      throw new NotFoundException(`No se encontró una rutina con el ID ${id}.`);
    }

    console.log('✅ [ConsultarDetallesRutinaService] Rutina encontrada:', rutina.nombre);
    console.log('📋 [ConsultarDetallesRutinaService] Ejercicios:', rutina.ejercicios.length);

    // Mapeamos la entidad de dominio y sus ejercicios a un DTO de respuesta detallado.
    // La categoría ahora viene directamente de la entidad de dominio.
    const ejerciciosDto: EjercicioDetalleDto[] = rutina.ejercicios.map(
      (ejercicio) => {
        console.log(`[ConsultarDetallesRutinaService] Mapeando ejercicio: ${ejercicio.nombre}, Categoría: ${ejercicio.categoria}`);
        return {
          id: ejercicio.id,
          nombre: ejercicio.nombre,
          descripcion: ejercicio.descripcion || '',
          setsReps: ejercicio.setsReps,
          duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
          categoria: ejercicio.categoria,
        };
      }
    );

    const rutinaDetallesDto: RutinaDetallesDto = {
      id: rutina.id,
      nombre: rutina.nombre,
      nivel: rutina.nivel,
      descripcion: `Rutina de ${rutina.nivel} para boxeo`, // Descripción temporal
      ejercicios: ejerciciosDto,
    };

    return rutinaDetallesDto;
  }
}
