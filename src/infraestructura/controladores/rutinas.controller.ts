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
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { CrearRutinaDto } from '../dtos/crear-rutina.dto';
import { CrearRutinaService } from '../../aplicacion/servicios/crear-rutina.service';
import { ConsultarRutinasService } from '../../aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from '../../aplicacion/servicios/consultar-detalles-rutina.service';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { IsOptional, IsString } from 'class-validator';

// DTO para la validación del query parameter
class FiltroRutinasDto {
  @IsString()
  @IsOptional()
  nivel?: string;
}

// Interfaz para el objeto Request con el usuario
interface RequestConUsuario {
  user: {
    userId: string;
    rol: string;
  };
}

@Controller('rutinas')
@UseGuards(JwtAuthGuard)
export class RutinasController {
  constructor(
    @Inject(CrearRutinaService)
    private readonly crearRutinaService: CrearRutinaService,
    @Inject(ConsultarRutinasService)
    private readonly consultarRutinasService: ConsultarRutinasService,
    @Inject(ConsultarDetallesRutinaService)
    private readonly consultarDetallesRutinaService: ConsultarDetallesRutinaService,
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
    if (req.user.rol !== 'Entrenador') {
      throw new ForbiddenException(
        'Solo los entrenadores pueden crear rutinas.',
      );
    }
    const dtoConCoachId = { ...crearRutinaDto, coachId: req.user.userId };
    return this.crearRutinaService.ejecutar(dtoConCoachId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async obtenerRutinas(@Query() filtros: FiltroRutinasDto) {
    return this.consultarRutinasService.ejecutar(filtros);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerDetallesDeRutina(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultarDetallesRutinaService.ejecutar(id);
  }
}
