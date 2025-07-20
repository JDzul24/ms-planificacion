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
  ) {}

  public async ejecutar(
    dto: CrearAsignacionDto,
    assignerId: string,
  ): Promise<{ mensaje: string; asignacionesCreadas: number }> {
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
      console.log(`Validando meta con ID: ${dto.metaId}`);
    } else {
      throw new UnprocessableEntityException(
        'Se debe proporcionar una rutina o una meta para la asignación.',
      );
    }

    const nuevasAsignaciones: Asignacion[] = dto.atletaIds.map((atletaId) =>
      Asignacion.crear({
        atletaId: atletaId,
        assignerId: assignerId,
        rutinaId: dto.rutinaId,
        metaId: dto.metaId,
      }),
    );

    await this.asignacionRepositorio.guardarMultiples(nuevasAsignaciones);

    return {
      mensaje: `Plan asignado con éxito a ${nuevasAsignaciones.length} atleta(s).`,
      asignacionesCreadas: nuevasAsignaciones.length,
    };
  }
}
