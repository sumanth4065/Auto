import { LossCause } from '../../enums';

export interface IWeatherDamageOptions {
  code: LossCause;
  description: string;
}
