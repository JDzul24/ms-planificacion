import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Este método es parte del ciclo de vida de NestJS.
  // Se ejecuta automáticamente cuando el módulo que contiene este servicio se inicializa.
  async onModuleInit() {
    await this.$connect();
  }

  // Este método también es parte del ciclo de vida de NestJS.
  // Se ejecuta automáticamente cuando la aplicación se está cerrando (ej. con Ctrl+C).
  // NestJS se asegura de llamarlo de forma ordenada.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
