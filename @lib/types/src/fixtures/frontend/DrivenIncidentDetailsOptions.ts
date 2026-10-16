import { LossCause } from '../../enums';
import { IIncidentDetailsOptions } from '../../contracts';

export const drivenIncidentOptions: IIncidentDetailsOptions[] = [
  {
    code: LossCause.IMPACTEDWITHANOTHERVEHICLE,
    description: 'Impact with other vehicle(s)'
  },
  {
    code: LossCause.ANIMALCOMP,
    description: 'Impact with an animal'
  },
  {
    code: LossCause.FIXEDCOLL,
    description: 'Impact with a fixed object or structure'
  },
  {
    code: LossCause.PEDBIKECOLLISION,
    description: 'Impact with a pedestrian or cyclist'
  },
  {
    code: LossCause.FLYINGCOMP,
    description: 'Struck by a falling or flying object'
  },
  {
    code: LossCause.WEATHERRELATEDCOMP,
    description: 'Damaged by weather'
  },
  {
    code: LossCause.SOLOCOLLISION,
    description: 'Rollover'
  }
];
