import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isRutinaOrMetaExclusivo', async: false })
export class IsRutinaOrMetaConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CrearAsignacionDto;
    const tieneRutina = !!object.rutinaId;
    const tieneMeta = !!object.metaId;
    return (tieneRutina && !tieneMeta) || (!tieneRutina && tieneMeta);
  }

  // --- CORRECCIÓN AQUÍ: Se elimina el parámetro 'args' que no se usa ---
  defaultMessage() {
    return 'Se debe proporcionar un "rutinaId" o un "metaId", pero no ambos a la vez.';
  }
}

export class CrearAsignacionDto {
  @IsUUID('4', { message: 'El ID de la rutina debe ser un UUID válido.' })
  @Validate(IsRutinaOrMetaConstraint)
  @IsOptional()
  rutinaId?: string;

  @IsUUID('4', { message: 'El ID de la meta debe ser un UUID válido.' })
  @IsOptional()
  metaId?: string;

  @IsArray({ message: 'La lista de atletas debe ser un arreglo.' })
  @IsNotEmpty({ message: 'Debe proporcionar al menos un atleta en la lista.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de atleta en la lista debe ser un UUID válido.',
  })
  atletaIds: string[];
}
