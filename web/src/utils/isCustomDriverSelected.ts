import { IDriverViewModel } from '@lib/types';

/**
 * Custom drivers are entered on the Custom Driver page and are not tied to a policy driver id.
 */
export function isCustomDriverSelected(selected: IDriverViewModel | undefined | null): boolean {
  if (!selected || (!selected.firstName?.trim() && !selected.lastName?.trim())) {
    return false;
  }
  const id = selected.driverId ?? selected.id;
  return !id;
}
