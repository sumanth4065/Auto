import { IIncidentDetailsOptions } from '../../contracts/frontend/IIncidentDetailsOptions';
import { LossCause } from '../../enums';

export const parkIncidentOptions: IIncidentDetailsOptions[] = [
  {
    code: LossCause.PARKEDUNOCCUPIED,
    description: 'Hit by another vehicle'
  },
  {
    code: LossCause.ROLLAWAYCOLL,
    description: 'Rolled away'
  },
  {
    code: LossCause.FLYINGCOMP,
    description: 'Struck by a falling or flying object'
  },
  {
    code: LossCause.VANDALISMCOMP,
    description: 'Vandalized'
  },
  {
    code: LossCause.TOTALTHEFTCOMP,
    description: 'Stolen'
  },
  {
    code: LossCause.FIRECOMP,
    description: 'Involved in a fire'
  },
  {
    code: LossCause.WEATHERRELATEDCOMP,
    description: 'Damaged by weather'
  }
];
