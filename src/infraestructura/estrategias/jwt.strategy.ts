import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// La dependencia a 'jwt-decode' ya no es necesaria.

// Definimos el tipo del payload que Cognito nos entrega,
// incluyendo el claim personalizado para el rol.
interface CognitoPayload {
  sub: string;
  email: string;
  'custom:rol': string;
  // Cognito añade muchos otros campos que podemos ignorar
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Para el modo de "sólo decodificación", usamos una función 'secretOrKeyProvider'
    // que simplemente indica éxito sin validar la firma.
    // Esto es INSEGURO para producción, pero cumple el requisito de emergencia.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Seguimos validando la expiración, es una buena práctica.
      secretOrKeyProvider: (
        request: any,
        rawJwtToken: any,
        done: (err: any, secretOrKey?: string | Buffer) => void,
      ) => {
        // Pasamos null como error y una clave ficticia. Passport continuará al método 'validate'.
        done(null, 'dummy_secret_for_decoding_only');
      },
      // Hacemos que la firma sea ignorada, al manejarla nosotros
      passReqToCallback: true,
    });
  }

  /**
   * --- SOBREESCRITURA DE EMERGENCIA (VERSIÓN 3 - ROBUSTA) ---
   * Este método ahora SÓLO se llamará si el token tiene un formato JWT válido y no ha expirado.
   * La firma de la firma se ignora debido a la configuración del super().
   * El payload está fuertemente tipado.
   */
  validate(
    request: any,
    payload: CognitoPayload,
  ): { userId: string; email: string; rol: string } {
    console.warn(
      '----------- MODO DE AUTENTICACIÓN INSEGURA ACTIVADO -----------',
    );
    console.warn(
      '-----------   LA VALIDACIÓN DE FIRMA JWT ESTÁ DESACTIVADA   -----------',
    );

    // Extraemos el rol del claim personalizado, con un fallback.
    const rol = payload['custom:rol'] || 'Atleta';

    if (!payload.sub || !payload.email) {
      // Si el token ni siquiera tiene la estructura básica, lo rechazamos.
      throw new UnauthorizedException(
        'Token JWT malformado: faltan claims esenciales.',
      );
    }

    // Devolvemos los datos REALES del usuario que vienen en el token.
    return {
      userId: payload.sub,
      email: payload.email,
      rol: rol,
    };
  }
}
