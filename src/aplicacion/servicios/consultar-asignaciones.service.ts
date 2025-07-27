import { Inject, Injectable } from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { AsignacionAtletaDto } from '../../infraestructura/dtos/asignacion-atleta.dto';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';

@Injectable()
export class ConsultarAsignacionesService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  async ejecutar(atletaId: string): Promise<AsignacionAtletaDto[]> {
    const asignaciones =
      await this.asignacionRepositorio.encontrarPorAtletaId(atletaId);

    const asignacionesDtoPromises = asignaciones
      // --- CORRECCIÓN AQUÍ: Filtramos cualquier asignación inválida que no tenga un plan asociado ---
      .filter((asignacion) => !!asignacion.rutinaId || !!asignacion.metaId)
      .map(async (asignacion) => {
        let nombrePlan = 'Plan no encontrado';
        const tipoPlan: 'Rutina' | 'Meta' = asignacion.rutinaId
          ? 'Rutina'
          : 'Meta';
        // Ahora estamos seguros de que idPlan no será undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const idPlan = (asignacion.rutinaId || asignacion.metaId)!;

        if (asignacion.rutinaId) {
          const rutina = await this.rutinaRepositorio.encontrarPorId(
            asignacion.rutinaId,
          );
          if (rutina) {
            nombrePlan = rutina.nombre;
          }
        } else if (asignacion.metaId) {
          // Lógica futura para obtener el nombre de la meta
          nombrePlan = `Meta: ${asignacion.metaId.substring(0, 8)}...`;
        }

        // El objeto retornado ahora cumple estrictamente con la interfaz AsignacionAtletaDto
        return {
          idAsignacion: asignacion.id,
          tipoPlan: tipoPlan,
          idPlan: idPlan,
          nombrePlan: nombrePlan,
          idAsignador: asignacion.assignerId,
          estado: asignacion.status,
          fechaAsignacion: asignacion.assignedAt,
        };
      });

    return Promise.all(asignacionesDtoPromises);
  }
}
