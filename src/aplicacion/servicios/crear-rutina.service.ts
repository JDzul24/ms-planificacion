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
    // Convertir sportId de string a number para la entidad de dominio
    const sportIdNumber = parseInt(dto.sportId, 10);
    if (isNaN(sportIdNumber)) {
      throw new Error('sportId debe ser un número válido');
    }

    // Procesar ejercicios: crear los que no existen en la base de datos
    const ejerciciosTransformados = [];
    
    for (const ejercicioDto of dto.ejercicios) {
      // Verificar si el ejercicio ya existe
      let ejercicioExistente = await this.ejercicioRepositorio.encontrarPorId(ejercicioDto.id);
      
      // Si no existe, crear el ejercicio dinámicamente
      if (!ejercicioExistente) {
        const nuevoEjercicio = Ejercicio.crear({
          nombre: ejercicioDto.nombre,
          setsReps: ejercicioDto.setsReps,
          descripcion: ejercicioDto.descripcion || null,
          duracionEstimadaSegundos: ejercicioDto.duracionEstimadaSegundos,
        });
        
        // Actualizar el ID para usar el ID del frontend
        (nuevoEjercicio as any).id = ejercicioDto.id;
        
        // Guardar el ejercicio con la categoría del frontend
        await this.ejercicioRepositorio.guardar(nuevoEjercicio, ejercicioDto.categoria, sportIdNumber);
      }

      // Agregar a la lista de ejercicios transformados
      ejerciciosTransformados.push({
        exerciseId: ejercicioDto.id,
        setsReps: ejercicioDto.setsReps,
        duracionEstimadaSegundos: ejercicioDto.duracionEstimadaSegundos,
      });
    }

    // La entidad de dominio se encarga de la validación y creación inicial
    const nuevaRutina = Rutina.crear({
      nombre: dto.nombre,
      nivel: dto.nivel,
      coachId: dto.coachId,
      sportId: sportIdNumber,
      descripcion: dto.descripcion,
      ejercicios: ejerciciosTransformados,
    });

    // Delegamos la persistencia al repositorio
    const rutinaGuardada = await this.rutinaRepositorio.guardar(nuevaRutina);

    return { id: rutinaGuardada.id };
  }


}
