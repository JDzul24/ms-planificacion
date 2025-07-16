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

  async ejecutar(dto: CrearRutinaDto): Promise<{ id: string }> {
    // La entidad de dominio se encarga de la validación y creación inicial
    const nuevaRutina = Rutina.crear({
      nombre: dto.nombre,
      nivel: dto.nivel,
      coachId: dto.coachId,
      sportId: dto.sportId,
      ejercicios: dto.ejercicios,
    });

    // Delegamos la persistencia al repositorio
    const rutinaGuardada = await this.rutinaRepositorio.guardar(nuevaRutina);

    return { id: rutinaGuardada.id };
  }
}
