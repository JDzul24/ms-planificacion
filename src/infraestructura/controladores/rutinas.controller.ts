import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Delete,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
  Req,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { CrearRutinaDto } from '../dtos/crear-rutina.dto';
import { ActualizarRutinaDto } from '../dtos/actualizar-rutina.dto';
import { CrearRutinaService } from '../../aplicacion/servicios/crear-rutina.service';
import { ConsultarRutinasService } from '../../aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from '../../aplicacion/servicios/consultar-detalles-rutina.service';
import { ActualizarRutinaService } from '../../aplicacion/servicios/actualizar-rutina.service';
import { EliminarRutinaService } from '../../aplicacion/servicios/eliminar-rutina.service';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { isUUID } from 'class-validator';

// --- CORRECCIÓN: Se elimina el decorador @Injectable ---
export class ParseArrayUUIDPipe implements PipeTransform<string, string[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): string[] {
    // <-- Se usa _metadata
    if (!value) {
      return [];
    }
    const ids = value.split(',');
    for (const id of ids) {
      if (!isUUID(id, '4')) {
        throw new BadRequestException(
          `El valor "${id}" no es un UUID v4 válido en la lista de IDs.`,
        );
      }
    }
    return ids;
  }
}

interface RequestConUsuario {
  user: { userId: string; rol: string };
}

@Controller('routines') // Cambiado a inglés para consistencia
@UseGuards(JwtAuthGuard)
export class RutinasController {
  constructor(
    @Inject(CrearRutinaService)
    private readonly crearRutinaService: CrearRutinaService,
    @Inject(ConsultarRutinasService)
    private readonly consultarRutinasService: ConsultarRutinasService,
    @Inject(ConsultarDetallesRutinaService)
    private readonly consultarDetallesRutinaService: ConsultarDetallesRutinaService,
    @Inject(ActualizarRutinaService)
    private readonly actualizarRutinaService: ActualizarRutinaService,
    @Inject(EliminarRutinaService)
    private readonly eliminarRutinaService: EliminarRutinaService,
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
  async crearRutina(
    @Body() crearRutinaDto: CrearRutinaDto,
    @Req() req: RequestConUsuario,
  ) {
    try {
      console.log('🚀 [RutinasController] Recibida petición crear rutina:', crearRutinaDto.nombre);
      console.log('👤 [RutinasController] Usuario:', req.user.userId, 'Rol:', req.user.rol);

      if (req.user.rol !== 'Entrenador') {
        throw new ForbiddenException(
          'Solo los entrenadores pueden crear rutinas.',
        );
      }

      const dtoConCoachId = { ...crearRutinaDto, coachId: req.user.userId };
      console.log('📋 [RutinasController] DTO completo:', JSON.stringify(dtoConCoachId, null, 2));

      const resultado = await this.crearRutinaService.ejecutar(dtoConCoachId);
      
      console.log('✅ [RutinasController] Rutina creada exitosamente:', resultado.id);
      return resultado;
    } catch (error) {
      console.error('❌ [RutinasController] Error en crear rutina:', error);
      console.error('📊 [RutinasController] Stack trace:', error.stack);
      
      // Re-lanzar el error para que NestJS lo maneje apropiadamente
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // --- CORRECCIÓN: Se eliminó la clase DTO innecesaria y el ValidationPipe ---
  async obtenerRutinas(
    @Req() req: RequestConUsuario,
    @Query('ids', new ParseArrayUUIDPipe()) ids?: string[],
    @Query('nivel') nivel?: string,
  ) {
    try {
      console.log('🔍 [GET /routines] Usuario logueado:', req.user.userId, 'Rol:', req.user.rol);
      console.log('🔍 [GET /routines] Filtros recibidos - ids:', ids, 'nivel:', nivel);
      
      // Solo los entrenadores pueden ver rutinas (sus propias rutinas)
      if (req.user.rol !== 'Entrenador') {
        throw new ForbiddenException(
          'Solo los entrenadores pueden consultar rutinas.',
        );
      }

      const resultado = await this.consultarRutinasService.ejecutar({ 
        ids, 
        nivel, 
        coachId: req.user.userId  // ← AGREGAR FILTRO POR COACH
      });
      
      console.log('✅ [GET /routines] Rutinas encontradas:', resultado.length);
      console.log('📊 [GET /routines] Datos:', JSON.stringify(resultado, null, 2));
      
      return resultado;
    } catch (error) {
      console.error('❌ [GET /routines] Error:', error);
      throw error;
    }
  }

  // TEMPORAL: Endpoint para diagnosticar la BD
  @Get('debug/all')
  @HttpCode(HttpStatus.OK)
  async diagnosticarBD(@Req() req: RequestConUsuario) {
    try {
      console.log('🔍 [DEBUG] Iniciando diagnóstico de BD');
      
      // Solo entrenadores pueden hacer debug
      if (req.user.rol !== 'Entrenador') {
        throw new ForbiddenException('Solo entrenadores pueden hacer debug');
      }

      // Usar Prisma directamente para verificar datos
      const prisma = (this.consultarRutinasService as any).rutinaRepositorio.prisma;
      
      // 1. Contar todas las rutinas
      const totalRutinas = await prisma.routine.count();
      console.log('📊 [DEBUG] Total rutinas en BD:', totalRutinas);
      
      // 2. Obtener todas las rutinas (limitadas a 10)
      const todasRutinas = await prisma.routine.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          targetLevel: true,
          coachId: true,
          sportId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('📊 [DEBUG] Rutinas encontradas:', todasRutinas);
      
      // 3. Rutinas del coach actual
      const rutinasDelCoach = await prisma.routine.findMany({
        where: { coachId: req.user.userId },
        select: {
          id: true,
          name: true,
          targetLevel: true,
          coachId: true,
          sportId: true,
          createdAt: true,
        }
      });
      
      console.log('📊 [DEBUG] Rutinas del coach actual:', rutinasDelCoach);
      
      return {
        debug: true,
        usuario: {
          id: req.user.userId,
          rol: req.user.rol
        },
        estadisticas: {
          totalRutinas,
          rutinasDelCoach: rutinasDelCoach.length
        },
        todasRutinas: todasRutinas,
        rutinasDelCoach: rutinasDelCoach
      };
    } catch (error) {
      console.error('❌ [DEBUG] Error:', error);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerDetallesDeRutina(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
  ) {
    // Permitir acceso tanto a entrenadores como a atletas
    if (req.user.rol !== 'Entrenador' && req.user.rol !== 'Atleta') {
      throw new ForbiddenException(
        'Solo los entrenadores y atletas pueden ver detalles de rutinas.',
      );
    }
    return this.consultarDetallesRutinaService.ejecutar(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async actualizarRutina(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarRutinaDto: ActualizarRutinaDto,
    @Req() req: RequestConUsuario,
  ) {
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden actualizar rutinas.',
      );
    }
    return this.actualizarRutinaService.ejecutar(
      id,
      actualizarRutinaDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarRutina(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
  ) {
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden eliminar rutinas.',
      );
    }
    return this.eliminarRutinaService.ejecutar(id, req.user.userId);
  }
}
