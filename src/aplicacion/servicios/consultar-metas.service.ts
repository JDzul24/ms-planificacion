import { Inject, Injectable } from '@nestjs/common';
import { IMetaRepositorio } from '../../dominio/repositorios/meta.repositorio';

@Injectable()
export class ConsultarMetasService {
  constructor(
    @Inject('IMetaRepositorio')
    private readonly metaRepositorio: IMetaRepositorio,
  ) {}

  async ejecutar(creadorId: string): Promise<{
    id: string;
    descripcion: string;
    fechaLimite?: string;
    createdAt: string;
  }[]> {
    const metas = await this.metaRepositorio.encontrarPorCreador(creadorId);

    return metas.map((meta) => ({
      id: meta.id,
      descripcion: meta.descripcion,
      fechaLimite: meta.fechaLimite?.toISOString(),
      createdAt: meta.createdAt.toISOString(),
    }));
  }
}