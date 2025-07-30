import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Delete,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { CrearAsignacionDto } from '../dtos/crear-asignacion.dto';
import { ActualizarEstadoAsignacionDto } from '../dtos/actualizar-estado-asignacion.dto';
import { CrearAsignacionService } from '../../aplicacion/servicios/crear-asignacion.service';
import { ConsultarAsignacionesService } from '../../aplicacion/servicios/consultar-asignaciones.service';
import { EliminarAsignacionService } from '../../aplicacion/servicios/eliminar-asignacion.service';
import { ActualizarEstadoAsignacionService } from '../../aplicacion/servicios/actualizar-estado-asignacion.service';

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
    @Inject(ConsultarAsignacionesService)
    private readonly consultarAsignacionesService: ConsultarAsignacionesService,
    @Inject(EliminarAsignacionService)
    private readonly eliminarAsignacionService: EliminarAsignacionService,
    @Inject(ActualizarEstadoAsignacionService)
    private readonly actualizarEstadoAsignacionService: ActualizarEstadoAsignacionService,
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

    console.log('🎯 [AsignacionesController] Payload recibido:', JSON.stringify(crearAsignacionDto));
    console.log('🎯 [AsignacionesController] Usuario:', { assignerId, rol });

    if (rol !== 'Entrenador') {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para asignar planes.',
      );
    }

    try {
      const resultado = await this.crearAsignacionService.ejecutar(crearAsignacionDto, assignerId);
      console.log('✅ [AsignacionesController] Asignación exitosa:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ [AsignacionesController] Error en asignación:', error.message);
      throw error;
    }
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

  /**
   * Endpoint para eliminar una asignación específica.
   * DELETE /assignments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarAsignacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
  ) {
    const { userId: entrenadorId, rol } = req.user;

    // Solo los entrenadores pueden eliminar asignaciones
    if (rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden eliminar asignaciones.',
      );
    }

    return this.eliminarAsignacionService.ejecutar(id, entrenadorId);
  }

  /**
   * Endpoint para actualizar el estado de una asignación.
   * PATCH /assignments/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async actualizarEstadoAsignacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarEstadoDto: ActualizarEstadoAsignacionDto,
    @Req() req: RequestConUsuario,
  ) {
    const { userId, rol } = req.user;

    return this.actualizarEstadoAsignacionService.ejecutar(
      id,
      actualizarEstadoDto,
      userId,
      rol,
    );
  }
}
