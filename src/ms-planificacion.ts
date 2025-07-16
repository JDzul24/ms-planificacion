import { Module } from '@nestjs/common';
import { RutinasController } from './infraestructura/controladores/rutinas.controller';
import { CrearRutinaService } from './aplicacion/servicios/crear-rutina.service';
import { PrismaService } from './infraestructura/db/prisma.service';
import { PrismaRutinaRepositorio } from './infraestructura/db/prisma-rutina.repositorio';
import { ConsultarRutinasService } from './aplicacion/servicios/consultar-rutinas.service';
import { ConsultarDetallesRutinaService } from './aplicacion/servicios/consultar-detalles-rutina.service';

@Module({
  imports: [],
  controllers: [RutinasController],
  providers: [
    // Servicios de Lógica de Negocio
    CrearRutinaService,
    ConsultarDetallesRutinaService,
    ConsultarRutinasService,

    // Servicio de Base de Datos
    PrismaService,

    // Proveedor del Repositorio
    {
      provide: 'IRutinaRepositorio',
      useClass: PrismaRutinaRepositorio,
    },
    // En el futuro, aquí se añadirían otros repositorios como 'IExercicioRepositorio'
  ],
})
export class MsPlanificacionModule {}
