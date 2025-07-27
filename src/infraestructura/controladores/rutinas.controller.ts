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
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { CrearRutinaDto } from '../dtos/crear-rutina.dto';
import { CrearRutinaService } from '../../aplicacion/servicios/crear-rutina.service';
import { ConsultarRutinasService } from '../../aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from '../../aplicacion/servicios/consultar-detalles-rutina.service';
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
  // --- CORRECCIÓN: Se eliminó la clase DTO innecesaria y el ValidationPipe ---
  async obtenerRutinas(
    @Query('ids', new ParseArrayUUIDPipe()) ids?: string[],
    @Query('nivel') nivel?: string,
  ) {
    return this.consultarRutinasService.ejecutar({ ids, nivel });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerDetallesDeRutina(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultarDetallesRutinaService.ejecutar(id);
  }
}
