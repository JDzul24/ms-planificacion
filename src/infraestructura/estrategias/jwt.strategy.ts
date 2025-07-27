import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define la estructura del payload que realmente se firma en auth.service.ts
interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
}

// Define la estructura del objeto 'user' que se adjuntará al request
export interface UsuarioPayload {
  userId: string;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No ignorar la expiración para seguridad
      ignoreExpiration: false,
      // Usar el mismo secreto que ms-identidad para compatibilidad
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Este método se ejecuta DESPUÉS de que Passport ha verificado
   * la firma y la expiración del JWT.
   * El payload que llega aquí es seguro y de confianza.
   */
  async validate(payload: JwtPayload): Promise<UsuarioPayload> {
    // Reenviamos los datos del token en formato estandarizado
    // para que esté disponible en `req.user` en todos los controladores.
    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
