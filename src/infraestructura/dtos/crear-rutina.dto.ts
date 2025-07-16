import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class EjercicioEnRutinaDto {
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  setsReps: string;
}

export class CrearRutinaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  nivel: string; // e.g., 'Principiante', 'Intermedio'

  @IsUUID()
  @IsNotEmpty()
  coachId: string; // En un sistema real, se obtendría del token de autenticación

  @IsNumber()
  @IsNotEmpty()
  sportId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioEnRutinaDto)
  ejercicios: EjercicioEnRutinaDto[];
}
