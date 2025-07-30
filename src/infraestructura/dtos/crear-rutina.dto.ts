import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  ValidateNested,
} from 'class-validator';

class EjercicioEnRutinaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  setsReps: string;

  @IsNumber()
  @IsNotEmpty()
  duracionEstimadaSegundos: number;

  @IsString()
  @IsIn(['calentamiento', 'resistencia', 'tecnica'])
  categoria: 'calentamiento' | 'resistencia' | 'tecnica';
}

export class CrearRutinaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Principiante', 'Intermedio', 'Avanzado'])
  nivel: string;

  @Transform(({ value }) => {
    // Convertir tanto string como number a string
    return typeof value === 'number' ? value.toString() : value;
  })
  @IsString()
  @IsNotEmpty()
  sportId: string; // Acepta tanto number como string del frontend

  @IsString()
  @IsOptional()
  descripcion?: string; // Agregar descripcion

  // coachId se agregará automáticamente desde el token JWT en el controller

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioEnRutinaDto)
  ejercicios: EjercicioEnRutinaDto[];
}
