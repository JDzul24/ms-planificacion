import { IsEnum } from 'class-validator';

export class ActualizarEstadoAsignacionDto {
  @IsEnum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'], {
    message: 'El estado debe ser PENDIENTE, EN_PROGRESO o COMPLETADA',
  })
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
}