import { Inject, Injectable } from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { RutinaResumenDto } from '../../infraestructura/dtos/rutina-resumen.dto';

@Injectable()
export class ConsultarRutinasService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  /**
   * Ejecuta la lógica para consultar y devolver una lista de rutinas.
   * @param filtros Objeto opcional con los filtros a aplicar, como nivel, IDs o coachId.
   * @returns Un arreglo de DTOs con el resumen de cada rutina.
   */
  async ejecutar(filtros?: {
    nivel?: string;
    ids?: string[];
    coachId?: string;
  }): Promise<RutinaResumenDto[]> {
    try {
      console.log('🔍 [ConsultarRutinasService] Filtros recibidos:', JSON.stringify(filtros, null, 2));
      
      // Pasa el objeto de filtros directamente al repositorio.
      // El repositorio se encarga de construir la consulta correcta.
      const rutinas = await this.rutinaRepositorio.encontrar(filtros);
      
      console.log('📊 [ConsultarRutinasService] Rutinas encontradas desde BD:', rutinas.length);
      rutinas.forEach((rutina, index) => {
        console.log(`   ${index + 1}. ${rutina.nombre} (ID: ${rutina.id}, Coach: ${rutina.coachId})`);
      });

      // Mapeamos las entidades de dominio completas a un DTO de resumen enriquecido.
      const rutinasDTOs = rutinas.map((rutina) => {
        const duracionSegundos = rutina.calcularDuracionEstimadaSegundos();
        const duracionMinutos = Math.ceil(duracionSegundos / 60);

        return {
          id: rutina.id,
          nombre: rutina.nombre,
          nivel: rutina.nivel,
          cantidadEjercicios: rutina.ejercicios.length,
          duracionEstimadaMinutos: duracionMinutos,
        };
      });

      console.log('✅ [ConsultarRutinasService] DTOs mapeados:', rutinasDTOs.length);
      console.log('📊 [ConsultarRutinasService] Resultado final:', JSON.stringify(rutinasDTOs, null, 2));

      return rutinasDTOs;
    } catch (error) {
      console.error('❌ [ConsultarRutinasService] Error:', error);
      throw error;
    }
  }
}
