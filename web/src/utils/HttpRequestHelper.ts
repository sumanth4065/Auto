import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import LogCannon from '@ace-clublabs/log-cannon';

export const getParams = (keys: string[]) => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  return keys.reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: params.get(curr) ?? `Typo Error! please check your url and/or parameter ${curr}`
    }),
    {}
  ) as { [k: (typeof keys)[number]]: string };
};

export class HttpRequestHelper {
  static get = (endpoint, authToken?, testRegion?) => {
    const config = HttpRequestHelper.getHeaders(authToken, testRegion);
    return axios.get(endpoint, config);
  };

  static post = (endpoint, data?, authToken?, testRegion?) => {
    const config = HttpRequestHelper.getHeaders(authToken, testRegion);
    return axios.post(endpoint, data, config);
  };

  static uuid: any;

  static getUUID = () => {
    if (!HttpRequestHelper.uuid) HttpRequestHelper.newUUID();
    return HttpRequestHelper.uuid;
  };

  static newUUID = (newuuid?) => {
    if (newuuid) HttpRequestHelper.uuid = newuuid;
    else HttpRequestHelper.uuid = uuidv4();
  };

  static getHeaders = (authToken?, testRegion?: string) => {
    let headers = {};

    headers['X-Ace-Session-Id'] = LogCannon.getSessionId();
    headers['X-Request-Id'] = HttpRequestHelper.getUUID();
    headers['CorrelationId'] = HttpRequestHelper.getUUID();

    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (testRegion) headers['X-Ace-Test-Region'] = testRegion;

    return headers;
  };
}
