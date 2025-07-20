import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { CrearAsignacionDto } from '../../infraestructura/dtos/crear-asignacion.dto';
import { Asignacion } from '../../dominio/entidades/asignacion.entity';

@Injectable()
export class CrearAsignacionService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
    // @Inject('IMetaRepositorio') private readonly metaRepositorio: IMetaRepositorio,
  ) {}

  public async ejecutar(
    dto: CrearAsignacionDto,
    assignerId: string,
  ): Promise<{ mensaje: string; asignacionesCreadas: number }> {
    // 1. Validar la existencia y propiedad del plan a asignar.
    if (dto.rutinaId) {
      const esValida =
        await this.rutinaRepositorio.validarExistenciaYPropietario(
          dto.rutinaId,
          assignerId,
        );
      if (!esValida) {
        throw new UnprocessableEntityException(
          'La rutina especificada no existe o no tienes permiso para asignarla.',
        );
      }
    } else if (dto.metaId) {
      // Lógica para validar la meta.
      console.log(`Validando meta con ID: ${dto.metaId}`);
    } else {
      // Esta validación es una segunda capa de defensa, ya que el DTO debería haberla prevenido.
      throw new UnprocessableEntityException(
        'Se debe proporcionar una rutina o una meta para la asignación.',
      );
    }

    // 2. Crear las entidades de dominio para cada asignación.
    const nuevasAsignaciones: Asignacion[] = dto.atletaIds.map((atletaId) =>
      Asignacion.crear({
        atletaId: atletaId,
        assignerId: assignerId,
        rutinaId: dto.rutinaId,
        metaId: dto.metaId,
      }),
    );

    // 3. Persistir todas las nuevas asignaciones.
    await this.asignacionRepositorio.guardarMultiples(nuevasAsignaciones);

    // 4. Devolver una respuesta exitosa.
    return {
      mensaje: `Plan asignado con éxito a ${nuevasAsignaciones.length} atleta(s).`,
      asignacionesCreadas: nuevasAsignaciones.length,
    };
  }
}
