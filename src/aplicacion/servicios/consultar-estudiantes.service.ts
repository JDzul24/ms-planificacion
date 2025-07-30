import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Servicio para consultar estudiantes del gimnasio del coach.
 * Este servicio realiza llamadas HTTP al microservicio de identidad.
 */
@Injectable()
export class ConsultarEstudiantesService {
  private identidadApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.identidadApiUrl = this.configService.get<string>('IDENTIDAD_API_URL') || 'https://api.capbox.site/identity/v1';
  }

  /**
   * Obtiene la lista de estudiantes (atletas) del gimnasio al que pertenece el coach.
   * @param coachId ID del entrenador autenticado
   * @param authToken Token JWT para autenticación
   * @returns Lista de estudiantes del gimnasio con información básica
   */
  async ejecutar(coachId: string, authToken: string): Promise<any[]> {
    try {
      console.log(`🔍 [ConsultarEstudiantesService] Buscando gimnasio del coach: ${coachId}`);

      // 1. Primero obtenemos el gimnasio al que pertenece el coach
      const gimnasioResponse = await firstValueFrom(
        this.httpService.get(`${this.identidadApiUrl}/usuarios/${coachId}/gimnasio`, {
          headers: {
            Authorization: authToken,
          },
        })
      );

      if (!gimnasioResponse.data || !gimnasioResponse.data.id) {
        console.log('❌ [ConsultarEstudiantesService] Coach no pertenece a ningún gimnasio');
        throw new HttpException(
          'No se encontró un gimnasio asociado al entrenador',
          HttpStatus.NOT_FOUND,
        );
      }

      const gymId = gimnasioResponse.data.id;
      console.log(`✅ [ConsultarEstudiantesService] Gimnasio encontrado: ${gymId}`);

      // 2. Luego obtenemos los miembros (estudiantes) del gimnasio
      const miembrosResponse = await firstValueFrom(
        this.httpService.get(`${this.identidadApiUrl}/gimnasios/${gymId}/miembros`, {
          headers: {
            Authorization: authToken,
          },
        })
      );

      // 3. Filtramos solo los atletas (estudiantes)
      const estudiantes = miembrosResponse.data.filter(
        (miembro: any) => miembro.rol === 'Atleta',
      );
      
      console.log(`✅ [ConsultarEstudiantesService] Estudiantes encontrados: ${estudiantes.length}`);
      
      // 4. Mapeamos a formato requerido por el frontend
      return estudiantes.map((estudiante: any) => ({
        id: estudiante.id,
        nombre: estudiante.nombre,
        nivel: estudiante.nivel || 'principiante',
        email: estudiante.email,
      }));
    } catch (error) {
      console.error('❌ [ConsultarEstudiantesService] Error:', error.message);
      
      // Si es un error de comunicación con el otro microservicio
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Error al comunicarse con el servicio de identidad',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException(
        'Error al consultar estudiantes del gimnasio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}