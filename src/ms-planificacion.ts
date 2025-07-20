import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// --- Controladores ---
import { RutinasController } from './infraestructura/controladores/rutinas.controller';
import { EjerciciosController } from './infraestructura/controladores/ejercicios.controller';
import { AsignacionesController } from './infraestructura/controladores/asignaciones.controller';

// --- Servicios de Aplicación ---
import { CrearRutinaService } from './aplicacion/servicios/crear-rutina.service';
import { ConsultarRutinasService } from './aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from './aplicacion/servicios/consultar-detalles-rutina.service';
import { ConsultarEjerciciosService } from './aplicacion/servicios/consultar-ejercicios.service';
import { CrearAsignacionService } from './aplicacion/servicios/crear-asignacion.service';
import { ConsultarAsignacionesService } from './aplicacion/servicios/consultar-asignaciones.service';

// --- Guardias y Estrategias ---
import { JwtAuthGuard } from './infraestructura/guardias/jwt-auth.guard';
import { JwtStrategy } from './infraestructura/estrategias/jwt.strategy';

// --- Infraestructura de Base de Datos ---
import { PrismaService } from './infraestructura/db/prisma.service';
import { PrismaRutinaRepositorio } from './infraestructura/db/prisma-rutina.repositorio';
import { PrismaEjercicioRepositorio } from './infraestructura/db/prisma-ejercicio.repositorio';
import { PrismaAsignacionRepositorio } from './infraestructura/db/prisma-asignacion.repositorio';

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
  ],
  providers: [
    // Servicios de Aplicación
    CrearRutinaService,
    ConsultarRutinasService,
    ConsultarDetallesRutinaService,
    ConsultarEjerciciosService,
    CrearAsignacionService,
    ConsultarAsignacionesService,

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
  ],
})
export class MsPlanificacionModule {}
