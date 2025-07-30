import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO para representar la información de un estudiante (atleta) de un gimnasio.
 * Este DTO es utilizado como respuesta para el endpoint /coach/gym-students.
 */
export class EstudianteGimnasioDto {
  /**
   * El ID único (UUID) del estudiante.
   */
  @IsUUID('4')
  id: string;

  /**
   * El nombre completo del estudiante.
   */
  @IsString()
  nombre: string;

  /**
   * El correo electrónico del estudiante.
   */
  @IsEmail()
  email: string;

  /**
   * El nivel de entrenamiento del estudiante (principiante, intermedio, avanzado).
   */
  @IsString()
  @IsOptional()
  nivel?: string;
}