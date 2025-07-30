import { Inject, Injectable } from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { IEjercicioRepositorio } from '../../dominio/repositorios/ejercicio.repositorio';
import { Rutina } from '../../dominio/entidades/rutina.entity';
import { Ejercicio } from '../../dominio/entidades/ejercicio.entity';
import { CrearRutinaDto } from '../../infraestructura/dtos/crear-rutina.dto';

@Injectable()
export class CrearRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
    @Inject('IEjercicioRepositorio')
    private readonly ejercicioRepositorio: IEjercicioRepositorio,
  ) {}

  async ejecutar(dto: CrearRutinaDto & { coachId: string }): Promise<{ id: string }> {
    try {
      console.log('🚀 [CrearRutinaService] Iniciando creación de rutina:', dto.nombre);
      console.log('📊 [CrearRutinaService] Datos recibidos:', JSON.stringify(dto, null, 2));

      // Convertir sportId de string a number para la entidad de dominio
      const sportIdNumber = parseInt(dto.sportId, 10);
      if (isNaN(sportIdNumber)) {
        throw new Error('sportId debe ser un número válido');
      }

      console.log('🏃 [CrearRutinaService] Procesando ejercicios:', dto.ejercicios.length);

      // Procesar ejercicios: asegurar que existan en la base de datos
      const ejerciciosTransformados = [];
      
      for (let i = 0; i < dto.ejercicios.length; i++) {
        const ejercicioDto = dto.ejercicios[i];
        console.log(`📋 [CrearRutinaService] Procesando ejercicio ${i + 1}:`, ejercicioDto.nombre);

        try {
          // Crear o actualizar el ejercicio usando el ID del frontend
          const ejercicioParaGuardar = Ejercicio.desdePersistencia({
            id: ejercicioDto.id,
            nombre: ejercicioDto.nombre,
            setsReps: '', // Este campo no se usa en la tabla Exercise
            descripcion: ejercicioDto.descripcion || null,
            duracionEstimadaSegundos: 0, // Este campo no se usa en la tabla Exercise
          });
          
          console.log(`💾 [CrearRutinaService] Guardando ejercicio: ${ejercicioDto.nombre} con categoria: ${ejercicioDto.categoria}`);
          
          // Guardar el ejercicio (upsert)
          await this.ejercicioRepositorio.guardar(ejercicioParaGuardar, ejercicioDto.categoria, sportIdNumber);

          console.log(`✅ [CrearRutinaService] Ejercicio guardado exitosamente: ${ejercicioDto.nombre}`);

          // Agregar a la lista de ejercicios transformados para la rutina
          ejerciciosTransformados.push({
            exerciseId: ejercicioDto.id,
            setsReps: ejercicioDto.setsReps,
            duracionEstimadaSegundos: ejercicioDto.duracionEstimadaSegundos,
          });
        } catch (error) {
          console.error(`❌ [CrearRutinaService] Error procesando ejercicio ${ejercicioDto.nombre}:`, error);
          throw new Error(`Error al procesar ejercicio "${ejercicioDto.nombre}": ${error.message}`);
        }
      }

      console.log('🏗️ [CrearRutinaService] Creando entidad de rutina');

      // La entidad de dominio se encarga de la validación y creación inicial
      const nuevaRutina = Rutina.crear({
        nombre: dto.nombre,
        nivel: dto.nivel,
        coachId: dto.coachId,
        sportId: sportIdNumber,
        descripcion: dto.descripcion,
        ejercicios: ejerciciosTransformados,
      });

      console.log('💾 [CrearRutinaService] Guardando rutina en base de datos');

      // Delegamos la persistencia al repositorio
      const rutinaGuardada = await this.rutinaRepositorio.guardar(nuevaRutina);

      console.log('✅ [CrearRutinaService] Rutina creada exitosamente:', rutinaGuardada.id);

      return { id: rutinaGuardada.id };
    } catch (error) {
      console.error('❌ [CrearRutinaService] Error crítico creando rutina:', error);
      console.error('📊 [CrearRutinaService] Stack trace:', error.stack);
      
      // Re-lanzar con información más específica
      throw new Error(`Error creando rutina "${dto.nombre}": ${error.message}`);
    }
  }


}
