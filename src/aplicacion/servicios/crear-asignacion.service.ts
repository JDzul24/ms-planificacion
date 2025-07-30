import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IAsignacionRepositorio } from '../../dominio/repositorios/asignacion.repositorio';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { CrearAsignacionDto } from '../../infraestructura/dtos/crear-asignacion.dto';
import { Asignacion } from '../../dominio/entidades/asignacion.entity';

@Injectable()
export class CrearAsignacionService {
  constructor(
    @Inject('IAsignacionRepositorio')
    private readonly asignacionRepositorio: IAsignacionRepositorio,
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  public async ejecutar(
    dto: CrearAsignacionDto,
    assignerId: string,
  ): Promise<{ mensaje: string; asignacionesCreadas: number }> {
    console.log('📥 [CrearAsignacionService] Recibiendo solicitud de asignación:', JSON.stringify(dto));
    
    // Validar que existe al menos un atleta
    if (!dto.atletaIds || dto.atletaIds.length === 0) {
      console.error('❌ [CrearAsignacionService] No se proporcionaron IDs de atletas');
      throw new UnprocessableEntityException(
        'Se debe proporcionar al menos un ID de atleta para la asignación.',
      );
    }
    
    // Imprimir los IDs de atletas para depuración
    console.log(`🏃 [CrearAsignacionService] Atletas a asignar: ${dto.atletaIds.length}`);
    dto.atletaIds.forEach((atletaId, idx) => {
      console.log(`🏃 [CrearAsignacionService] Atleta ${idx + 1}: ${atletaId}`);
    });
    
    // Validar que existe una rutina o meta
    if (dto.rutinaId) {
      console.log(`🔍 [CrearAsignacionService] Validando rutina: ${dto.rutinaId}`);
      const esValida =
        await this.rutinaRepositorio.validarExistenciaYPropietario(
          dto.rutinaId,
          assignerId,
        );
      if (!esValida) {
        console.error(`❌ [CrearAsignacionService] Rutina inválida o sin permisos: ${dto.rutinaId}`);
        throw new UnprocessableEntityException(
          'La rutina especificada no existe o no tienes permiso para asignarla.',
        );
      }
      console.log(`✅ [CrearAsignacionService] Rutina validada: ${dto.rutinaId}`);
    } else if (dto.metaId) {
      console.log(`🎯 [CrearAsignacionService] Validando meta con ID: ${dto.metaId}`);
      // Aquí podría añadirse validación para metas si fuera necesario
    } else {
      console.error('❌ [CrearAsignacionService] No se proporcionó rutina ni meta');
      throw new UnprocessableEntityException(
        'Se debe proporcionar una rutina o una meta para la asignación.',
      );
    }

    console.log('🔄 [CrearAsignacionService] Creando objetos de asignación...');
    
    // Crear objetos de asignación
    const nuevasAsignaciones: Asignacion[] = dto.atletaIds.map((atletaId) => {
      console.log(`🔄 [CrearAsignacionService] Creando asignación para atleta: ${atletaId}`);
      return Asignacion.crear({
        atletaId: atletaId,
        assignerId: assignerId,
        rutinaId: dto.rutinaId,
        metaId: dto.metaId,
      });
    });

    try {
      console.log('💾 [CrearAsignacionService] Guardando asignaciones en la base de datos...');
      await this.asignacionRepositorio.guardarMultiples(nuevasAsignaciones);
      console.log('✅ [CrearAsignacionService] Asignaciones guardadas exitosamente');
      
      return {
        mensaje: `Plan asignado con éxito a ${nuevasAsignaciones.length} atleta(s).`,
        asignacionesCreadas: nuevasAsignaciones.length,
      };
    } catch (error) {
      console.error('❌ [CrearAsignacionService] Error al guardar asignaciones:', error.message);
      
      // Personalizar mensaje según el error
      let mensajeError = 'Error al guardar las asignaciones.';
      
      if (error.message.includes('atleta')) {
        mensajeError = 'Uno o más IDs de estudiantes no son válidos o no existen en el sistema.';
      } else if (error.message.includes('rutina')) {
        mensajeError = 'La rutina especificada no existe o no es válida.';
      }
      
      throw new UnprocessableEntityException(mensajeError);
    }
  }
}
