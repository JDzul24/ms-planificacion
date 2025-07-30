import { Meta } from '../entidades/meta.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Meta.
 */
export interface IMetaRepositorio {
  /**
   * Guarda una nueva meta en la base de datos.
   * @param meta La entidad Meta a persistir.
   * @returns Una promesa que resuelve a la entidad Meta guardada.
   */
  guardar(meta: Meta): Promise<Meta>;

  /**
   * Busca todas las metas creadas por un entrenador específico.
   * @param creadorId El ID del entrenador que creó las metas.
   * @returns Una promesa que resuelve a un arreglo de entidades Meta.
   */
  encontrarPorCreador(creadorId: string): Promise<Meta[]>;

  /**
   * Busca una meta específica por su ID.
   * @param id El UUID de la meta a buscar.
   * @returns Una promesa que resuelve a la entidad Meta si se encuentra, o null en caso contrario.
   */
  encontrarPorId(id: string): Promise<Meta | null>;

  /**
   * Actualiza una meta existente en la base de datos.
   * @param id El UUID de la meta a actualizar.
   * @param datosActualizacion Los datos parciales para actualizar la meta.
   * @returns Una promesa que resuelve a la entidad Meta actualizada.
   */
  actualizar(id: string, datosActualizacion: {
    descripcion?: string;
    fechaLimite?: Date;
  }): Promise<Meta>;

  /**
   * Elimina una meta de la base de datos.
   * @param id El UUID de la meta a eliminar.
   * @returns Una promesa que resuelve cuando la eliminación se completa exitosamente.
   */
  eliminar(id: string): Promise<void>;

  /**
   * Verifica si una meta pertenece a un entrenador específico.
   * @param metaId El ID de la meta a validar.
   * @param creadorId El ID del entrenador que debe ser el propietario.
   * @returns Una promesa que resuelve a `true` si la meta le pertenece, `false` en caso contrario.
   */
  validarPropietario(metaId: string, creadorId: string): Promise<boolean>;
}