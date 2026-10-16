import { IWeatherDamageOptions } from '../../contracts/frontend/IWeatherDamageOptions';
import { LossCause } from '../../enums';

export const weatherDamageOptions: IWeatherDamageOptions[] = [
  {
    code: LossCause.WINDCOMP,
    description: 'Wind'
  },
  {
    code: LossCause.TORNADOCOMP,
    description: 'Tornado'
  },
  {
    code: LossCause.HAILCOMP,
    description: 'Hail'
  },
  {
    code: LossCause.FLOODCOMP,
    description: 'Flood'
  },
  {
    code: LossCause.EARTHQUAKECOMP,
    description: 'Earthquake'
  },
  {
    code: LossCause.OTHERCOMP,
    description: 'Other'
  }
];

export const drivenWeatherDamageOptions: IWeatherDamageOptions[] = [
  {
    code: LossCause.WINDCOMP,
    description: 'Wind'
  },
  {
    code: LossCause.HAILCOMP,
    description: 'Hail'
  },
  {
    code: LossCause.FLOODCOMP,
    description: 'Flood/water'
  }
];
