import { Inject, Injectable } from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { Rutina } from '../../dominio/entidades/rutina.entity';
import { CrearRutinaDto } from '../../infraestructura/dtos/crear-rutina.dto';

@Injectable()
export class CrearRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  async ejecutar(dto: CrearRutinaDto & { coachId: string }): Promise<{ id: string }> {
    // Convertir sportId de string a number para la entidad de dominio
    const sportIdNumber = parseInt(dto.sportId, 10);
    if (isNaN(sportIdNumber)) {
      throw new Error('sportId debe ser un número válido');
    }

    // Transformar ejercicios para que coincidan con la estructura esperada por la entidad
    const ejerciciosTransformados = dto.ejercicios.map((ejercicio) => ({
      exerciseId: ejercicio.id, // Mapear id a exerciseId
      setsReps: ejercicio.setsReps,
      duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
    }));

    // La entidad de dominio se encarga de la validación y creación inicial
    const nuevaRutina = Rutina.crear({
      nombre: dto.nombre,
      nivel: dto.nivel,
      coachId: dto.coachId,
      sportId: sportIdNumber,
      ejercicios: ejerciciosTransformados,
    });

    // Delegamos la persistencia al repositorio
    const rutinaGuardada = await this.rutinaRepositorio.guardar(nuevaRutina);

    return { id: rutinaGuardada.id };
  }
}
