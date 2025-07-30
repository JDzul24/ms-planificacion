import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  ForbiddenException,
  HttpException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { ConsultarEstudiantesService } from '../../aplicacion/servicios/consultar-estudiantes.service';
import { EstudianteGimnasioDto } from '../dtos/estudiante-gimnasio.dto';

/**
 * Interfaz para extender el objeto Request y añadir la propiedad user
 * que es adjuntada por Passport después de validar el token JWT.
 */
interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
  headers: {
    authorization?: string;
  };
}

/**
 * Controlador para endpoints relacionados con operaciones específicas de coaches.
 */
@Controller('coach')
@UseGuards(JwtAuthGuard)
export class CoachController {
  constructor(
    private readonly consultarEstudiantesService: ConsultarEstudiantesService,
  ) {}

  /**
   * Obtiene la lista de estudiantes (atletas) del gimnasio al que pertenece el coach autenticado.
   * @param req Request con información del usuario autenticado
   * @param nivel Filtro opcional por nivel de entrenamiento
   * @returns Lista de estudiantes con información básica
   */
  @Get('gym-students')
  @HttpCode(HttpStatus.OK)
  async obtenerEstudiantesDeGimnasio(
    @Req() req: RequestConUsuario,
    @Query('nivel') nivel?: string,
  ): Promise<EstudianteGimnasioDto[]> {
    try {
      const { userId: coachId, rol } = req.user;
      const authToken = req.headers.authorization;

      // Verificar que el usuario autenticado es un entrenador
      if (rol !== 'Entrenador') {
        throw new ForbiddenException(
          'Solo los entrenadores pueden acceder a esta información',
        );
      }

      console.log(`🏋️‍♂️ [CoachController] Obteniendo estudiantes para coach: ${coachId}`);
      
      // Obtener todos los estudiantes del gimnasio
      const estudiantes = await this.consultarEstudiantesService.ejecutar(
        coachId,
        authToken,
      );
      
      // Aplicar filtro por nivel si se proporciona
      if (nivel) {
        const nivelLowerCase = nivel.toLowerCase();
        console.log(`🔍 [CoachController] Aplicando filtro por nivel: ${nivelLowerCase}`);
        
        return estudiantes.filter(
          (estudiante) => estudiante.nivel?.toLowerCase() === nivelLowerCase,
        );
      }
      
      return estudiantes;
    } catch (error) {
      console.error('❌ [CoachController] Error:', error.message);
      
      const statusCode = error instanceof HttpException 
        ? error.getStatus() 
        : HttpStatus.INTERNAL_SERVER_ERROR;
        
      throw new HttpException(
        error.message || 'Error al obtener estudiantes',
        statusCode,
      );
    }
  }
}