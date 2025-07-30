import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// --- Controladores ---
import { RutinasController } from './infraestructura/controladores/rutinas.controller';
import { EjerciciosController } from './infraestructura/controladores/ejercicios.controller';
import { AsignacionesController } from './infraestructura/controladores/asignaciones.controller';
import { DeportesController } from './infraestructura/controladores/deportes.controller';
import { MetasController } from './infraestructura/controladores/metas.controller';

// --- Servicios de Aplicación ---
import { CrearRutinaService } from './aplicacion/servicios/crear-rutina.service';
import { ConsultarRutinasService } from './aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from './aplicacion/servicios/consultar-detalles-rutina.service';
import { ActualizarRutinaService } from './aplicacion/servicios/actualizar-rutina.service';
import { EliminarRutinaService } from './aplicacion/servicios/eliminar-rutina.service';
import { ConsultarEjerciciosService } from './aplicacion/servicios/consultar-ejercicios.service';
import { CrearAsignacionService } from './aplicacion/servicios/crear-asignacion.service';
import { ConsultarAsignacionesService } from './aplicacion/servicios/consultar-asignaciones.service';
import { EliminarAsignacionService } from './aplicacion/servicios/eliminar-asignacion.service';
import { ActualizarEstadoAsignacionService } from './aplicacion/servicios/actualizar-estado-asignacion.service';
import { CrearDeporteService } from './aplicacion/servicios/crear-deporte.service';
import { ConsultarDeportesService } from './aplicacion/servicios/consultar-deportes.service';
import { ActualizarDeporteService } from './aplicacion/servicios/actualizar-deporte.service';
import { EliminarDeporteService } from './aplicacion/servicios/eliminar-deporte.service';
import { CrearMetaService } from './aplicacion/servicios/crear-meta.service';
import { ConsultarMetasService } from './aplicacion/servicios/consultar-metas.service';
import { ActualizarMetaService } from './aplicacion/servicios/actualizar-meta.service';
import { EliminarMetaService } from './aplicacion/servicios/eliminar-meta.service';

// --- Guardias y Estrategias ---
import { JwtAuthGuard } from './infraestructura/guardias/jwt-auth.guard';
import { JwtStrategy } from './infraestructura/estrategias/jwt.strategy';

// --- Infraestructura de Base de Datos ---
import { PrismaService } from './infraestructura/db/prisma.service';
import { PrismaRutinaRepositorio } from './infraestructura/db/prisma-rutina.repositorio';
import { PrismaEjercicioRepositorio } from './infraestructura/db/prisma-ejercicio.repositorio';
import { PrismaAsignacionRepositorio } from './infraestructura/db/prisma-asignacion.repositorio';
import { PrismaDeporteRepositorio } from './infraestructura/db/prisma-deporte.repositorio';
import { PrismaMetaRepositorio } from './infraestructura/db/prisma-meta.repositorio';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [
    RutinasController,
    EjerciciosController,
    AsignacionesController,
    DeportesController,
    MetasController,
  ],
  providers: [
    // Servicios de Aplicación
    CrearRutinaService,
    ConsultarRutinasService,
    ConsultarDetallesRutinaService,
    ActualizarRutinaService,
    EliminarRutinaService,
    ConsultarEjerciciosService,
    CrearAsignacionService,
    ConsultarAsignacionesService,
    EliminarAsignacionService,
    ActualizarEstadoAsignacionService,
    CrearDeporteService,
    ConsultarDeportesService,
    ActualizarDeporteService,
    EliminarDeporteService,
    CrearMetaService,
    ConsultarMetasService,
    ActualizarMetaService,
    EliminarMetaService,

    // Guardias y Estrategias
    JwtAuthGuard,
    JwtStrategy,

    // Infraestructura de Base de Datos
    PrismaService,
    {
      provide: 'IRutinaRepositorio',
      useClass: PrismaRutinaRepositorio,
    },
    {
      provide: 'IEjercicioRepositorio',
      useClass: PrismaEjercicioRepositorio,
    },
    {
      provide: 'IAsignacionRepositorio',
      useClass: PrismaAsignacionRepositorio,
    },
    {
      provide: 'IDeporteRepositorio',
      useClass: PrismaDeporteRepositorio,
    },
    {
      provide: 'IMetaRepositorio',
      useClass: PrismaMetaRepositorio,
    },
  ],
})
export class MsPlanificacionModule {}
