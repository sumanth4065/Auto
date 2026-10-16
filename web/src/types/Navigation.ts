import { master_pages } from '../shared/pages';
import { State } from '../store/reducer';

export type AppPathname = keyof typeof master_pages;

//TODO: Documment this code <Carlos Urrego> - <Andres Cano>
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<
        keyof T,
        symbol
      >]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

type StateKeys = DotNestedKeys<State>;

export type RouteType = {
  appState: StateKeys;
  default?: string;
  [key: string]: string | RouteType | undefined;
};
