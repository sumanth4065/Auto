import { master_pages, Pages } from '../../shared/pages';
import { State } from '../../store/reducer';
import { useMemo } from 'react';
import { AppPathname, RouteType } from '../../types';
import { getRoute } from './getRoute';

export const useBackNavigation = (path: AppPathname, appState: Partial<State>): string => {

  const backRoute = useMemo(() => {
    const backNavigation = master_pages[path];

    if (backNavigation && typeof backNavigation !== 'string') {
      // if the backNavigation.appState is a multi-key object,
      // return the matching backNavigation based on the leaf node
      // for example:
      //    if backNavigation.appState = witness.selection
      //    returns backNavigation['selection']

      return getRoute(backNavigation as RouteType, appState)
    } else {
      return backNavigation;
    }
  }, [path, appState]);

  return backRoute;
};
