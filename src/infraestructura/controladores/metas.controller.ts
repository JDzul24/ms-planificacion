import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { CrearMetaDto } from '../dtos/crear-meta.dto';
import { ActualizarMetaDto } from '../dtos/actualizar-meta.dto';
import { CrearMetaService } from '../../aplicacion/servicios/crear-meta.service';
import { ConsultarMetasService } from '../../aplicacion/servicios/consultar-metas.service';
import { ActualizarMetaService } from '../../aplicacion/servicios/actualizar-meta.service';
import { EliminarMetaService } from '../../aplicacion/servicios/eliminar-meta.service';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';

interface RequestConUsuario {
  user: { userId: string; rol: string };
}

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class MetasController {
  constructor(
    @Inject(CrearMetaService)
    private readonly crearMetaService: CrearMetaService,
    @Inject(ConsultarMetasService)
    private readonly consultarMetasService: ConsultarMetasService,
    @Inject(ActualizarMetaService)
    private readonly actualizarMetaService: ActualizarMetaService,
    @Inject(EliminarMetaService)
    private readonly eliminarMetaService: EliminarMetaService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerMetas(@Req() req: RequestConUsuario) {
    // Solo los entrenadores pueden crear y gestionar metas
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden gestionar metas.',
      );
    }
    return this.consultarMetasService.ejecutar(req.user.userId);
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
  async crearMeta(
    @Body() crearMetaDto: CrearMetaDto,
    @Req() req: RequestConUsuario,
  ) {
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden crear metas.',
      );
    }
    return this.crearMetaService.ejecutar(crearMetaDto, req.user.userId);
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
  async actualizarMeta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() actualizarMetaDto: ActualizarMetaDto,
    @Req() req: RequestConUsuario,
  ) {
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden actualizar metas.',
      );
    }
    return this.actualizarMetaService.ejecutar(id, actualizarMetaDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarMeta(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConUsuario,
  ) {
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden eliminar metas.',
      );
    }
    return this.eliminarMetaService.ejecutar(id, req.user.userId);
  }
}