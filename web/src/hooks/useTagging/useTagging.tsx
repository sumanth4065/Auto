import { useLocation, useOutletContext } from 'react-router';
import { State } from '../../store/reducer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppPathname } from '../../types';
import { TaggingService } from '../../utils/TaggingService/TaggingService';

export const useTagging = (fireTagByDefault = true, customPageTag?: string) => {
  const [appState] = useOutletContext<[State, Function]>();
  const taggingService = useMemo(() => new TaggingService(appState.brand), [appState.brand]);
  const location = useLocation();
  const [tags, setTags] = useState(() =>
    taggingService.BuildTag(appState, location.pathname as AppPathname, undefined, customPageTag)
  );

  const fireTag = useCallback(
    (cta?: string) => {
      const built = taggingService.BuildTag(
        appState,
        location.pathname as AppPathname,
        cta ?? undefined,
        customPageTag
      );
      if (!built) return;
      setTags(built);
      taggingService.FireTag();
    },
    [appState, location.pathname, customPageTag]
  );

  useEffect(() => {
    const built = taggingService.BuildTag(
      appState,
      location.pathname as AppPathname,
      undefined,
      customPageTag
    );
    if (!built) return;
    setTags(built);
    if (fireTagByDefault) {
      taggingService.FireTag();
    }
  }, []);

  return {
    tags,
    fireTag
  };
};
