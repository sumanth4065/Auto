import { State } from '../../store/reducer';
import { RouteType } from '../../types';

export const getRoute = (backNavigation: RouteType, appState: Partial<State>) => {
  const keys = backNavigation.appState.split('.');
  let obj = appState[keys[0]];
  keys.forEach((key, index) => {
    if (index !== 0 && obj) {
      obj = obj[key];
    }
  });
  // Try matching the actual value first
  let result = backNavigation[String(obj)];
  // Then try boolean representation if value is truthy/falsy
  if (!result && (obj === true || obj === false)) {
    result = backNavigation[String(obj)];
  }
  if (!result && obj) {
    result = backNavigation['true'];
  }
  if (!result && !obj) {
    result = backNavigation['false'];
  }
  if (result && typeof result !== 'string') {
    return getRoute(result, appState);
  }
  return result ?? backNavigation.default;
};
