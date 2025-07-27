import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

// Esta variable de entorno DEBE ser configurada en el entorno de despliegue.
// Representa el User Pool de Cognito donde se validarán los usuarios.
// Ejemplo: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx'
const COGNITO_USER_POOL_URL = process.env.COGNITO_USER_POOL_URL;

if (!COGNITO_USER_POOL_URL) {
  throw new Error(
    'La variable de entorno COGNITO_USER_POOL_URL no está definida.',
  );
}

// Interfaz que define la estructura del payload de un token JWT de Cognito.
// Asegura que el código que lo consume reciba los campos esperados.
interface CognitoPayload {
  sub: string;
  email: string;
  'custom:rol': string; // Claim personalizado para el rol del usuario.
  token_use: 'id' | 'access';
  [key: string]: any;
}

// Interfaz para el objeto 'user' que se adjuntará al request de NestJS.
// Este objeto es el que usarán los controladores y servicios.
export interface UsuarioAutenticado {
  userId: string;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token JWT del encabezado 'Authorization' como un Bearer Token.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // La validación de la expiración del token la gestiona passport-jwt.
      // Si el token está expirado, la petición será rechazada automáticamente.
      ignoreExpiration: false,

      // passport-jwt usa esta función para obtener la clave pública necesaria
      // para verificar la firma del token JWT. La clave se obtiene dinámicamente
      // del JWKS (JSON Web Key Set) de Cognito, gestionado por jwks-rsa.
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${COGNITO_USER_POOL_URL}/.well-known/jwks.json`,
      }),

      // El issuer (iss) y el audience (aud) son campos del token que verifican
      // su procedencia y para quién fue emitido. Desactivamos la validación del
      // audience (aud) porque no es un claim estándar en los ID tokens de Cognito,
      // pero mantenemos la del issuer (iss) para asegurar que el token proviene
      // de nuestro User Pool.
      issuer: COGNITO_USER_POOL_URL,
      algorithms: ['RS256'], // Algoritmo de firma que usa Cognito.
    });
  }

  /**
   * Método de validación que se ejecuta después de que passport-jwt verifica
   * la firma y la expiración del token.
   *
   * @param payload El contenido decodificado del token JWT.
   * @returns Un objeto 'user' simplificado que se adjuntará al request.
   */
  async validate(payload: CognitoPayload): Promise<UsuarioAutenticado> {
    // Verificación de que el token es un 'ID token' y no un 'access token'.
    // El ID token contiene la información del usuario, mientras que el access token
    // se usa para conceder permisos a APIs. Para la autenticación en nuestro
    // backend, confiamos en el ID token.
    if (payload.token_use !== 'id') {
      throw new UnauthorizedException(
        'El token proporcionado no es un ID token válido.',
      );
    }

    // Extraemos el rol del claim personalizado, con un valor por defecto.
    const rol = payload['custom:rol'] || 'Atleta';

    // Creamos y devolvemos un objeto de usuario estandarizado.
    // Este objeto estará disponible en `req.user` en los controladores.
    return {
      userId: payload.sub,
      email: payload.email,
      rol: rol,
    };
  }
}
