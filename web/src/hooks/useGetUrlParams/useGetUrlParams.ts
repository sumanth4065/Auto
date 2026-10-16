import { useParams } from 'react-router';
import { QueryParamKeys } from '../../shared/queryParams';
import LogCannon from '@ace-clublabs/log-cannon';

/**
 * Encodes the values in a query string while preserving the keys and structure.
 *
 * Takes a query string and applies URL encoding (via encodeURIComponent) to each
 * value while keeping the keys unchanged. This ensures special characters in values
 * are properly encoded for URL usage.
 *
 * @param queryString - The query string to process (e.g., "key1=value1&key2=value with spaces")
 * @returns A new query string with encoded values (e.g., "key1=value1&key2=value%20with%20spaces")
 *
 * @example
 * encodeQueryValues("name=John Doe&email=test@example.com")
 * // Returns: "name=John%20Doe&email=test%40example.com"
 */
function encodeQueryValues(queryString: string): string {
  const regex = /([^&=]+)=([^&]*)/g;
  let result = '';
  let match: RegExpExecArray | null;

  while ((match = regex.exec(queryString)) !== null) {
    const key = match[1];
    const value = match[2];
    result += `${key}=${encodeURIComponent(value)}&`;
  }

  // Remove trailing '&' if present
  return result.replace(/&$/, '');
}

export interface UrlParams {
  policyGuidFromParams: string | undefined;
  area: string | undefined;
  clubCode: string | undefined;
  isMobileApp: string | undefined;
  isMobileAppAccidentDetection: string | undefined;
  crashDatePrediction: string | undefined;
  splashStart: string | undefined;
  splashEnd: string | undefined;
  isW: string | undefined;
  queryParams: URLSearchParams;
  searchQueryString: string;
}

export const useGetUrlParams = (): UrlParams => {
  const searchQueryString = window.location.search;
  const searchQueryStringAppended = (searchQueryString || '').replace('?', '&');
  let queryParams = new URLSearchParams(encodeQueryValues(searchQueryStringAppended));

  if (Array.from(queryParams).length === 0) {
    queryParams = new URLSearchParams(localStorage.getItem('urlParams') || '');
  } else {
    localStorage.setItem('urlParams', queryParams.toString());
  }

  const area = queryParams.get(QueryParamKeys.Area) || undefined;
  const clubCode = queryParams.get(QueryParamKeys.ClubCode) || undefined;
  const isMobileApp = queryParams.get(QueryParamKeys.IsMobileApp) || undefined;
  const isMobileAppAccidentDetection =
    queryParams.get(QueryParamKeys.IsMobileAppAccidentDetection) || undefined;
  const crashDatePrediction = queryParams.get(QueryParamKeys.CrashDatePrediction) || undefined;
  const splashStart = queryParams.get(QueryParamKeys.SplashStart) || undefined;
  const splashEnd = queryParams.get(QueryParamKeys.SplashEnd) || undefined;
  const isW = queryParams.get(QueryParamKeys.IsW) || undefined;

  let policyGuidFromParams: string | undefined = undefined;
  try {
    const { policyGuid } = useParams<{
      policyGuid: string | undefined;
    }>();
    policyGuidFromParams = policyGuid;
  } catch (err) {
    LogCannon.error('Error getting policyGuid from params', { error: err });
  }

  return {
    policyGuidFromParams,
    area,
    clubCode,
    isMobileApp,
    isMobileAppAccidentDetection,
    crashDatePrediction,
    splashStart,
    splashEnd,
    isW,
    queryParams,
    searchQueryString
  };
};
