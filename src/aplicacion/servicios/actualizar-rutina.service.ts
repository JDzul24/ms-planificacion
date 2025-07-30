import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { ActualizarRutinaDto } from '../../infraestructura/dtos/actualizar-rutina.dto';
import { RutinaDetallesDto } from '../../infraestructura/dtos/rutina-detalles.dto';

@Injectable()
export class ActualizarRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  async ejecutar(
    rutinaId: string,
    dto: ActualizarRutinaDto,
    coachId: string,
  ): Promise<RutinaDetallesDto> {
    // Verificar que la rutina existe y pertenece al coach
    const esValida = await this.rutinaRepositorio.validarExistenciaYPropietario(
      rutinaId,
      coachId,
    );

    if (!esValida) {
      // Verificar si la rutina existe para dar un mensaje más específico
      const rutina = await this.rutinaRepositorio.encontrarPorId(rutinaId);
      if (!rutina) {
        throw new NotFoundException('La rutina especificada no existe.');
      } else {
        throw new ForbiddenException(
          'No tienes permisos para actualizar esta rutina.',
        );
      }
    }

    // Actualizar la rutina
    const rutinaActualizada = await this.rutinaRepositorio.actualizar(
      rutinaId,
      {
        nombre: dto.nombre,
        nivel: dto.nivel,
        descripcion: dto.descripcion,
        ejercicios: dto.ejercicios,
      },
    );

    // Mapear a DTO de respuesta
    return {
      id: rutinaActualizada.id,
      nombre: rutinaActualizada.nombre,
      nivel: rutinaActualizada.nivel,
      descripcion: null, // TODO: Agregar descripción a la entidad
      ejercicios: rutinaActualizada.ejercicios.map((ejercicio) => ({
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        descripcion: ejercicio.descripcion,
        setsReps: ejercicio.setsReps,
        duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
        categoria: 'tecnica' as const, // Valor por defecto - debería ser configurado según el tipo de ejercicio
      })),
    };
  }
}