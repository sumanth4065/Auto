import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import { SplitFactory } from '@splitsoftware/splitio';
var path = require('path');

export class RemoteAppConfigHelper {
  // generic feature flag helper
  private _client: SplitIO.IClient;
  private key: string;
  private logger: Logger;

  public constructor(logger?: Logger) {
    this.logger = logger || Logger.getInstance();
  }

  private createFactory(): SplitIO.ISDK {
    this.logger.debug('Creating Remote App config Factory');
    return SplitFactory({
      core: {
        authorizationKey: this.key
      },
      ...(this.key === 'localhost'
        ? {
            features: path.join(__dirname, '.split')
          }
        : {})
    });
  }

  public async initialize() {
    this.logger.debug('Initializing Remote App config Factory');
    if (!this._client) {
      this._client = this.createFactory().client();
      return this._client.ready();
    }
  }

  /**
   * Use a key for different Feature flag's environments or localhost
   * @param authorizationKey Feature flag's environment key
   * @param enableLocalhost Read feature flags from .split local file
   */
  public setKey(authorizationKey: string, enableLocalhost: boolean = false) {
    this.logger.debug('Setting Remote App config Factory key');
    if (enableLocalhost && process.env.NODE_ENV === 'test') {
      this.key = 'localhost';
    } else {
      this.key = authorizationKey;
    }
  }

  public async disconnect() {
    this.logger.debug('Disconnect and destroy Remote App config Client');
    return this._client.destroy();
  }

  public getkey() {
    return this.key;
  }

  /**
   * Get single treatment / feature flag from Split.io for the given environment key
   * @param targetTreatment Desired feature-flag / env variable
   * @param userID Random string, better to provide a customerId or session ID.
   * @returns
   */
  public async getTreatment(
    targetTreatment: string,
    userID: string = 'ISS-CHANGE-COVERAGE-TEST', // @TODO - Why this hardcoded default value? Should remove this
    attributes: any = null
  ) {
    this.logger.debug(
      'Getting single treatment / feature flag from Split.io for the given environment key'
    );
    return attributes !== null
      ? await this._client.getTreatment(userID, targetTreatment, attributes)
      : await this._client.getTreatment(userID, targetTreatment);
  }

  /**
   * Get single treatment / feature flag from Split.io for the given environment key
   * @param targetTreatment Desired feature-flag / env variable
   * @param userID Random string, better to provide a customerId or session ID.
   * @returns
   */
  public async getTreatments(
    targetTreatment: string[],
    userID: string = 'ISS-CHANGE-COVERAGE-TEST', // @TODO - Why this hardcoded default value? Should remove this
    attributes: any = null
  ) {
    this.logger.debug(
      'Getting multiple treatments / feature flags from Split.io for the given environment key'
    );
    return attributes !== null
      ? await this._client.getTreatments(userID, targetTreatment, attributes)
      : await this._client.getTreatments(userID, targetTreatment);
  }

  /**
   * Get single treatment / feature flag with dynamic configuration from Split.io for the given environment key
   * @param targetTreatment Desired feature-flag / env variable
   * @param userID Random string, better to provide a customerId or session ID.
   * @returns
   */
  public async getTreatmentWithConfig(
    targetTreatment: string,
    userID: string = 'ISS-CHANGE-COVERAGE-TEST', // @TODO - Why this hardcoded default value? Should remove this
    attributes: any = null
  ) {
    this.logger.debug(
      'Getting single treatment / feature flag with dynamic configuration from Split.io for the given environment key'
    );

    return attributes !== null
      ? await this._client.getTreatmentWithConfig(userID, targetTreatment, attributes)
      : await this._client.getTreatmentWithConfig(userID, targetTreatment);
  }

  /**
   * Get multiple treatments / features flag with dynamic configuration from Split.io for the given environment key
   * @param targetTreatment Desired feature-flag / env variable
   * @param userID Random string, better to provide a customerId or session ID.
   * @returns
   */
  public async getTreatmentsWithConfig(
    targetTreatment: string[],
    userID: string = 'ISS-CHANGE-COVERAGE-TEST', // @TODO - Why this hardcoded default value? Should remove this
    attributes: any = null
  ) {
    this.logger.debug(
      'Getting multiple treatments / feature flags with dynamic configuration  from Split.io for the given environment key'
    );

    return attributes !== null
      ? await this._client.getTreatmentsWithConfig(userID, targetTreatment, attributes)
      : await this._client.getTreatmentsWithConfig(userID, targetTreatment);
  }
}
