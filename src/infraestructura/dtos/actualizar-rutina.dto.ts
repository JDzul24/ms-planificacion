import { IsString, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class EjercicioEnRutinaDto {
  @IsUUID()
  exerciseId: string;

  @IsString()
  setsReps: string;

  @IsOptional()
  duracionEstimadaSegundos?: number;
}

export class ActualizarRutinaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  nivel?: string; // e.g., 'Principiante', 'Intermedio', 'Avanzado'

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioEnRutinaDto)
  @IsOptional()
  ejercicios?: EjercicioEnRutinaDto[];
}