import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { CrearAsignacionDto } from '../dtos/crear-asignacion.dto';
import { CrearAsignacionService } from '../../aplicacion/servicios/crear-asignacion.service';
import { ConsultarAsignacionesService } from '../../aplicacion/servicios/consultar-asignaciones.service';

/**
 * Interfaz para extender el objeto Request de Express y añadir la propiedad 'user',
 * que es adjuntada por la estrategia de Passport después de validar un token JWT.
 */
interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
}

@Controller('assignments')
@UseGuards(JwtAuthGuard) // Protegemos todas las rutas de este controlador
export class AsignacionesController {
  constructor(
    @Inject(CrearAsignacionService)
    private readonly crearAsignacionService: CrearAsignacionService,
    // Se inyecta el nuevo servicio para consultar asignaciones
    @Inject(ConsultarAsignacionesService)
    private readonly consultarAsignacionesService: ConsultarAsignacionesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async crearAsignacion(
    @Req() req: RequestConUsuario,
    @Body() crearAsignacionDto: CrearAsignacionDto,
  ) {
    const { userId: assignerId, rol } = req.user;

    if (rol !== 'Entrenador') {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para asignar planes.',
      );
    }

    return this.crearAsignacionService.ejecutar(crearAsignacionDto, assignerId);
  }

  /**
   * Endpoint protegido para que un atleta obtenga sus planes asignados.
   * GET /assignments/me
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async obtenerMisAsignaciones(@Req() req: RequestConUsuario) {
    const { userId: atletaId, rol } = req.user;

    // Lógica de autorización: solo los atletas pueden consultar "sus" asignaciones.
    if (rol !== 'Atleta') {
      throw new ForbiddenException(
        'Esta acción solo está disponible para los atletas.',
      );
    }

    return this.consultarAsignacionesService.ejecutar(atletaId);
  }
}
