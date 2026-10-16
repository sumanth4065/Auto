import { LossCause } from '../../enums';
import { IAccidentDetailsOptions } from '../../contracts';

export const accidentDetailsDrivenOptions: IAccidentDetailsOptions[] = [
  {
    code: LossCause.REARENDCOLL,
    description: 'Rear-end'
  },
  {
    code: LossCause.INTERSECTCOLL,
    description: 'Intersection'
  },
  {
    code: LossCause.TURNINGCOLL,
    description: 'Turning'
  },
  {
    code: LossCause.LANEMERGECOLL,
    description: 'Lane change'
  },
  {
    code: LossCause.HITRUNCOLL,
    description: 'Hit and run'
  },
  {
    code: LossCause.BACKCOLLISION,
    description: 'Backing'
  }
];
