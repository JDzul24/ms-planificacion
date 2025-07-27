import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MsPlanificacionModule } from './ms-planificacion';

/**
 * Función de arranque (bootstrap) para el microservicio de Planificación.
 */
async function bootstrap() {
  const app = await NestFactory.create(MsPlanificacionModule);

  // --- CORRECCIÓN 1: Habilitar CORS explícitamente ---
  // Se configura la política de CORS para permitir peticiones desde el entorno
  // de desarrollo local de Flutter y cualquier otro origen.
  app.enableCors({
    origin: '*', // Permite cualquier origen para máxima flexibilidad en desarrollo.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // --- CORRECCIÓN 2: Establecer el Prefijo Global de la API ---
  // Todas las rutas definidas en los controladores ahora tendrán el prefijo '/v1'.
  // Ejemplo: @Controller('rutinas') -> /v1/rutinas
  app.setGlobalPrefix('/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // La lógica de 'shutdown hooks' ahora es manejada por el ciclo de vida
  // del módulo a través de OnModuleDestroy en PrismaService,
  // por lo que no se necesita una llamada explícita aquí.

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

// Se utiliza 'void' para indicar explícitamente que no estamos esperando
// a que la promesa de bootstrap se resuelva, satisfaciendo la regla de ESLint.
void bootstrap();
