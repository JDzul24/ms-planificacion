import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CrearDeporteDto } from '../dtos/crear-deporte.dto';
import { ActualizarDeporteDto } from '../dtos/actualizar-deporte.dto';
import { CrearDeporteService } from '../../aplicacion/servicios/crear-deporte.service';
import { ConsultarDeportesService } from '../../aplicacion/servicios/consultar-deportes.service';
import { ActualizarDeporteService } from '../../aplicacion/servicios/actualizar-deporte.service';
import { EliminarDeporteService } from '../../aplicacion/servicios/eliminar-deporte.service';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';

interface RequestConUsuario {
  user: { userId: string; rol: string };
}

@Controller('sports')
@UseGuards(JwtAuthGuard)
export class DeportesController {
  constructor(
    @Inject(CrearDeporteService)
    private readonly crearDeporteService: CrearDeporteService,
    @Inject(ConsultarDeportesService)
    private readonly consultarDeportesService: ConsultarDeportesService,
    @Inject(ActualizarDeporteService)
    private readonly actualizarDeporteService: ActualizarDeporteService,
    @Inject(EliminarDeporteService)
    private readonly eliminarDeporteService: EliminarDeporteService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerDeportes() {
    return this.consultarDeportesService.ejecutar();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async crearDeporte(
    @Body() crearDeporteDto: CrearDeporteDto,
    @Req() req: RequestConUsuario,
  ) {
    // Solo administradores pueden crear deportes
    if (req.user.rol !== 'Admin') {
      throw new ForbiddenException(
        'Solo los administradores pueden crear deportes.',
      );
    }
    return this.crearDeporteService.ejecutar(crearDeporteDto);
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
  async actualizarDeporte(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDeporteDto: ActualizarDeporteDto,
    @Req() req: RequestConUsuario,
  ) {
    // Solo administradores pueden actualizar deportes
    if (req.user.rol !== 'Admin') {
      throw new ForbiddenException(
        'Solo los administradores pueden actualizar deportes.',
      );
    }
    return this.actualizarDeporteService.ejecutar(id, actualizarDeporteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarDeporte(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
  ) {
    // Solo administradores pueden eliminar deportes
    if (req.user.rol !== 'Admin') {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar deportes.',
      );
    }
    return this.eliminarDeporteService.ejecutar(id);
  }
}