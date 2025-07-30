import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IRutinaRepositorio } from '../../dominio/repositorios/rutina.repositorio';
import { ActualizarRutinaDto } from '../../infraestructura/dtos/actualizar-rutina.dto';
import { RutinaDetallesDto } from '../../infraestructura/dtos/rutina-detalles.dto';

@Injectable()
export class ActualizarRutinaService {
  constructor(
    @Inject('IRutinaRepositorio')
    private readonly rutinaRepositorio: IRutinaRepositorio,
  ) {}

  async ejecutar(
    rutinaId: string,
    dto: ActualizarRutinaDto,
    coachId: string,
  ): Promise<RutinaDetallesDto> {
    // Verificar que la rutina existe y pertenece al coach
    const esValida = await this.rutinaRepositorio.validarExistenciaYPropietario(
      rutinaId,
      coachId,
    );

    if (!esValida) {
      // Verificar si la rutina existe para dar un mensaje más específico
      const rutina = await this.rutinaRepositorio.encontrarPorId(rutinaId);
      if (!rutina) {
        throw new NotFoundException('La rutina especificada no existe.');
      } else {
        throw new ForbiddenException(
          'No tienes permisos para actualizar esta rutina.',
        );
      }
    }

    // Actualizar la rutina
    const rutinaActualizada = await this.rutinaRepositorio.actualizar(
      rutinaId,
      {
        nombre: dto.nombre,
        nivel: dto.nivel,
        descripcion: dto.descripcion,
        ejercicios: dto.ejercicios,
      },
    );

    console.log('✅ [ActualizarRutinaService] Rutina actualizada correctamente:', rutinaActualizada.id);
    
    // Obtener categorías desde la base de datos para cada ejercicio
    console.log('🔍 [ActualizarRutinaService] Recuperando categorías de ejercicios desde BD...');
    
    // Acceder directamente a los datos del ejercicio en Prisma (a través de casting)
    const ejercicioIds = rutinaActualizada.ejercicios.map(e => e.id);
    const ejerciciosConCategoria = await (this.rutinaRepositorio as any).prisma.exercise.findMany({
      where: {
        id: { in: ejercicioIds }
      },
      select: {
        id: true,
        name: true,
        categoria: true
      }
    });

    console.log('📊 [ActualizarRutinaService] Categorías recuperadas de BD:', 
                ejerciciosConCategoria.map(e => `${e.name}: ${e.categoria || 'sin categoría'}`).join(', '));
    
    // Mapear a DTO de respuesta usando las categorías reales
    return {
      id: rutinaActualizada.id,
      nombre: rutinaActualizada.nombre,
      nivel: rutinaActualizada.nivel,
      descripcion: rutinaActualizada.descripcion || null,
      ejercicios: rutinaActualizada.ejercicios.map((ejercicio) => {
        // Buscar la categoría real en los datos obtenidos
        const ejercicioDb = ejerciciosConCategoria.find(e => e.id === ejercicio.id);
        const categoria = ejercicioDb?.categoria || 'tecnica';
        
        console.log(`📋 [ActualizarRutinaService] Ejercicio ${ejercicio.nombre} - Categoría: ${categoria}`);
        
        return {
          id: ejercicio.id,
          nombre: ejercicio.nombre,
          descripcion: ejercicio.descripcion,
          setsReps: ejercicio.setsReps,
          duracionEstimadaSegundos: ejercicio.duracionEstimadaSegundos,
          categoria: categoria as 'calentamiento' | 'resistencia' | 'tecnica',
        };
      }),
    };
  }
}