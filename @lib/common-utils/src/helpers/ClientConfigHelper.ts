import {
  ClientApplication,
  IClientConfig
} from '@ace-clublabs/iss-cci-clients';

export enum SecretId {
  GUIDEWIRE_SECRET_ID = 'insuranceclaims/guidewirehub/policycenter',
  CCI_MULESOFT_SECRET_ID = 'adProxy/secrets/team/insuranceclaims'
}

/**
 * Parameters for building client configuration
 */
export interface IBuildClientConfigParams {
  authBearer: string;
  clubCode: string;
  clientApplication: ClientApplication;
  testRegion?: string;
}

/**
 * Helper class for building CCI client configuration objects
 */
export class ClientConfigHelper {
  static buildClientConfig(params: IBuildClientConfigParams): IClientConfig {
    return {
      authBearer: params.authBearer,
      clientApplication: params.clientApplication ?? ClientApplication.AUTO_CLAIMS,
      clubCode: params.clubCode,
      gwScopes: process.env.GW_SCOPES || 'read',
      gwSecretId: SecretId.GUIDEWIRE_SECRET_ID,
      mulesoftSecretId: SecretId.CCI_MULESOFT_SECRET_ID,
      teamId: 'insuranceselfservice',
      testRegion: params.testRegion
    };
  }
}
