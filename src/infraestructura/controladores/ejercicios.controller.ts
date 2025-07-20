import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConsultarEjerciciosService } from '../../aplicacion/servicios/consultar-ejercicios.service';
import { JwtAuthGuard } from '../../../../ms-identidad/src/infraestructura/guardias/jwt-auth.guard'; // Importar la guardia JWT

// DTO para la validación del query parameter
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class FiltroEjerciciosDto {
  @IsInt({ message: 'El ID del deporte debe ser un número entero.' })
  @Min(1, { message: 'El ID del deporte debe ser un número positivo.' })
  @IsOptional()
  @Type(() => Number) // Transformar el string de la query a número
  sportId?: number;
}

@Controller('exercises') // Ruta base: /v1/planning/exercises
@UseGuards(JwtAuthGuard) // Proteger todas las rutas de este controlador
export class EjerciciosController {
  constructor(
    @Inject(ConsultarEjerciciosService)
    private readonly consultarEjerciciosService: ConsultarEjerciciosService,
  ) {}

  /**
   * Endpoint para obtener una lista de ejercicios disponibles.
   * Puede ser filtrado por el ID de un deporte.
   * GET /exercises?sportId=1
   *
   * @param filtros Los parámetros de consulta para filtrar los ejercicios.
   * @returns Un arreglo de DTOs con la información resumida de los ejercicios.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async obtenerEjercicios(@Query() filtros: FiltroEjerciciosDto) {
    // La guardia JwtAuthGuard ya ha validado que el usuario está autenticado.
    // La lógica de negocio se delega completamente al servicio.
    return this.consultarEjerciciosService.ejecutar(filtros);
  }
}
