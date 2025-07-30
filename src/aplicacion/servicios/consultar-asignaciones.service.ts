import { Inject, Injectable } from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { AsignacionAtletaDto } from '../../infraestructura/dtos/asignacion-atleta.dto';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConsultarAsignacionesService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async ejecutar(atletaId: string): Promise<AsignacionAtletaDto[]> {
    const asignaciones =
      await this.asignacionRepositorio.encontrarPorAtletaId(atletaId);

    const asignacionesDtoPromises = asignaciones
      // Filtrar solo asignaciones de rutinas (no metas por ahora)
      .filter((asignacion) => !!asignacion.rutinaId)
      .map(async (asignacion) => {
        let nombreRutina = 'Rutina no encontrada';
        let nombreEntrenador = 'Entrenador';

        // Obtener información de la rutina
        if (asignacion.rutinaId) {
          const rutina = await this.rutinaRepositorio.encontrarPorId(
            asignacion.rutinaId,
          );
          if (rutina) {
            nombreRutina = rutina.nombre;
          }
        }

        // Obtener información del entrenador desde ms-identidad
        try {
          const identityServiceUrl = this.configService.get<string>('IDENTITY_SERVICE_URL') || 'http://localhost:3000';
          const response = await firstValueFrom(
            this.httpService.get(`${identityServiceUrl}/usuarios/${asignacion.assignerId}`)
          );
          if (response.data && response.data.nombre) {
            nombreEntrenador = response.data.nombre;
          }
        } catch (error) {
          console.log('Error obteniendo datos del entrenador:', error.message);
          // Usar valor por defecto si falla
        }

        return {
          id: asignacion.id,
          nombreRutina: nombreRutina,
          nombreEntrenador: nombreEntrenador,
          estado: asignacion.status as 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA',
          fechaAsignacion: asignacion.assignedAt,
          rutinaId: asignacion.rutinaId!,
          assignerId: asignacion.assignerId,
        };
      });

    return Promise.all(asignacionesDtoPromises);
  }
}
