import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// El payload del token, tal como lo firma el ms-identidad.
interface JwtPayload {
  sub: string; // ID del usuario
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // --- CORRECCIÓN DE TIPADO ESTRICTO ---
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // Lanzamos un error explícito durante el arranque si el secreto no está definido.
      // Esto previene fallos de seguridad en producción.
      throw new Error(
        'El secreto JWT no está definido en las variables de entorno.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // Ahora estamos seguros de que es un 'string'
    });
  }

  /**
   * Valida el payload del token JWT.
   * Este método es síncrono ya que no realiza operaciones asíncronas (como I/O).
   * @param payload El payload decodificado del token.
   * @returns Un objeto simplificado del usuario.
   */
  // --- CORRECCIÓN DE ESLINT: Se elimina 'async' ya que no se usa 'await' ---
  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    rol: string;
  } {
    if (!payload.sub || !payload.email || !payload.rol) {
      throw new UnauthorizedException(
        'Token de autenticación inválido o malformado.',
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
