import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CrearMetaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion: string;

  @IsDateString({}, { message: 'La fecha límite debe estar en formato ISO 8601' })
  @IsOptional()
  fechaLimite?: string; // ISO 8601 string
}