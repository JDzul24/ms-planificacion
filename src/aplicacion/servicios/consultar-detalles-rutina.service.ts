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
        descripcion: ejercicio.descripcion || '',
        setsReps: ejercicio.setsReps,
        duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
        categoria: this.determinarCategoria(ejercicio.nombre),
      }),
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

  /**
   * Determina la categoría de un ejercicio basándose en su nombre.
   * Esta es una implementación temporal hasta que se agregue el campo categoria a la entidad.
   */
  private determinarCategoria(nombreEjercicio: string): 'calentamiento' | 'resistencia' | 'tecnica' {
    const nombre = nombreEjercicio.toLowerCase();

    // Palabras clave para calentamiento
    const calentamientoKeywords = [
      'calentamiento', 'estiramiento', 'movilidad', 'articular', 
      'rotacion', 'rotación', 'flexibilidad', 'preparacion', 'preparación',
      'hombro', 'cuello', 'muñeca', 'tobillo', 'cadera'
    ];

    // Palabras clave para resistencia
    const resistenciaKeywords = [
      'burpees', 'salto', 'correr', 'trote', 'cardio', 'resistencia',
      'mountain', 'climber', 'jumping', 'jack', 'sentadilla', 'squat',
      'plancha', 'plank', 'abdomen', 'flexion', 'flexión', 'lagartija',
      'push', 'up', 'escalador', 'sprint'
    ];

    // Palabras clave para técnica
    const tecnicaKeywords = [
      'jab', 'cross', 'hook', 'uppercut', 'directo', 'gancho',
      'sombra', 'shadow', 'boxing', 'boxeo', 'golpe', 'combo',
      'combinacion', 'combinación', 'tecnica', 'técnica', 'defensa',
      'esquiva', 'bloqueo', 'guardia', 'stance', 'postura'
    ];

    // Verificar calentamiento
    if (calentamientoKeywords.some(keyword => nombre.includes(keyword))) {
      return 'calentamiento';
    }

    // Verificar técnica
    if (tecnicaKeywords.some(keyword => nombre.includes(keyword))) {
      return 'tecnica';
    }

    // Verificar resistencia
    if (resistenciaKeywords.some(keyword => nombre.includes(keyword))) {
      return 'resistencia';
    }

    // Por defecto, asignar a técnica si no se puede determinar
    return 'tecnica';
  }
}
