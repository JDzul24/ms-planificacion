import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guardia de autenticación para el microservicio de Planificación.
 * Protege las rutas activando la estrategia 'jwt' de Passport,
 * la cual validará el Access Token JWT.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
