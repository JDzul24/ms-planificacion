import { Deporte } from '../entidades/deporte.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Deporte.
 */
export interface IDeporteRepositorio {
  /**
   * Guarda un nuevo deporte en la base de datos.
   * @param deporte La entidad Deporte a persistir.
   * @returns Una promesa que resuelve a la entidad Deporte guardada.
   */
  guardar(deporte: Deporte): Promise<Deporte>;

  /**
   * Busca y devuelve una lista de todos los deportes disponibles.
   * @returns Una promesa que resuelve a un arreglo de entidades Deporte.
   */
  encontrarTodos(): Promise<Deporte[]>;

  /**
   * Busca un deporte específico por su ID.
   * @param id El ID numérico del deporte a buscar.
   * @returns Una promesa que resuelve a la entidad Deporte si se encuentra, o null en caso contrario.
   */
  encontrarPorId(id: number): Promise<Deporte | null>;

  /**
   * Actualiza un deporte existente en la base de datos.
   * @param id El ID del deporte a actualizar.
   * @param datosActualizacion Los datos parciales para actualizar el deporte.
   * @returns Una promesa que resuelve a la entidad Deporte actualizada.
   */
  actualizar(id: number, datosActualizacion: {
    nombre?: string;
    descripcion?: string;
  }): Promise<Deporte>;

  /**
   * Elimina un deporte de la base de datos.
   * @param id El ID del deporte a eliminar.
   * @returns Una promesa que resuelve cuando la eliminación se completa exitosamente.
   */
  eliminar(id: number): Promise<void>;

  /**
   * Verifica si un deporte con el nombre especificado ya existe.
   * @param nombre El nombre del deporte a verificar.
   * @param idExcluir ID del deporte a excluir de la verificación (para actualizaciones).
   * @returns Una promesa que resuelve a `true` si existe, `false` en caso contrario.
   */
  existeNombre(nombre: string, idExcluir?: number): Promise<boolean>;
}