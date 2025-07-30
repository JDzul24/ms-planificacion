import { IsString, IsOptional, IsArray, ValidateNested, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class EjercicioEnRutinaDto {
  @IsUUID()
  exerciseId: string;

  @IsString()
  setsReps: string;

  @IsOptional()
  duracionEstimadaSegundos?: number;
  
  @IsOptional()
  @IsString()
  @IsIn(['calentamiento', 'resistencia', 'tecnica'])
  categoria?: 'calentamiento' | 'resistencia' | 'tecnica';
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