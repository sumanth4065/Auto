import { IEvent } from '@ace-clublabs/aws-lambda-v3';
import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { Uuid } from '@lib/utility';
import { ConfigOptions } from '@ace-clublabs/iss-common-util';

export const lambdaAxiosInstance: AxiosInstance = createAxiosInstance();

/**
 * Use the https instance on prod, but for development will just need an http instance
 * @param optHeaders optional headers
 */
export function createAxiosInstance(optHeaders?): AxiosInstance {
  const agent = new https.Agent({
    rejectUnauthorized: true
  });
  // Client Id and Secret will be overwritten by the Web-Server in sources
  const defaultHeaders = {
    Accept: 'application/json, application/xml, text/plain, */*'
  };
  const httpsInstance: AxiosInstance = axios.create({
    httpsAgent: agent,
    headers: optHeaders ? { ...defaultHeaders, ...optHeaders } : defaultHeaders
  });
  return httpsInstance;
}

class Helpers {
  public static executeGetCall(
    url: string,
    gatewayId: string,
    payload: string,
    configOptions?: ConfigOptions
  ): Promise<string> {
    const optionalHeaders = {
      'x-ace-correlation-id': configOptions?.requestId || Uuid.getId(),
      ...configOptions?.headerInfo,
      //Authorization: authBearer,
      'x-apigw-api-id': gatewayId
    };

    return new Promise(resolve => {
      lambdaAxiosInstance
        .get(url, {
          headers: optionalHeaders
        })
        .then(response => {
          resolve(response.data);
        });
    });
  }

  public static executePostCall(
    url: string,
    gatewayId: string,
    payload: string,
    configOptions?: ConfigOptions
  ): Promise<any> {
    const optionalHeaders = {
      'x-ace-correlation-id': configOptions?.requestId || Uuid.getId(),
      ...configOptions?.headerInfo,
      'x-apigw-api-id': gatewayId
    };

    return lambdaAxiosInstance
      .post(url, payload, {
        headers: optionalHeaders
      })
      .then(res => res.data);
  }

  public static buildCommonAPIPayload(event: IEvent): any {
    const result = {
      ...event
    };
    return result;
  }
}

export default Helpers;
