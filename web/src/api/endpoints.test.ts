import {
  Environments,
  getApiDomain,
  getApiDomainBehindLogin,
  getEndpoints,
  getEnvironmentFromHost,
  getPolicyViewApiDomain
} from './endpoints';

describe('endpoints', () => {
  describe('getEnvironmentFromHost', () => {
    let env: any;
    describe('when url starts with appdev1 or app.dev', () => {
      it('should return devX env', () => {
        env = getEnvironmentFromHost('app.dev.clublabs.net');
        expect(env).toEqual(Environments.dev1);

        env = getEnvironmentFromHost('appdev1.ace.aaa.com');
        expect(env).toEqual(Environments.dev1);

        env = getEnvironmentFromHost('appdev2.ace.aaa.com');
        expect(env).toEqual(Environments.dev2);
      });
    });

    describe('when url starts with appqa1 or app.qa', () => {
      it('should return qaX env', () => {
        env = getEnvironmentFromHost('app.qa.clublabs.net');
        expect(env).toEqual(Environments.qa1);

        env = getEnvironmentFromHost('appqa1.ace.aaa.com');
        expect(env).toEqual(Environments.qa1);

        env = getEnvironmentFromHost('appqa2.ace.aaa.com');
        expect(env).toEqual(Environments.qa2);
      });
    });

    describe('when url starts with appuat1 or app.uat', () => {
      it('should return uatX env', () => {
        env = getEnvironmentFromHost('app.uat.clublabs.net');
        expect(env).toEqual(Environments.uat1);

        env = getEnvironmentFromHost('appuat1.ace.aaa.com');
        expect(env).toEqual(Environments.uat1);

        env = getEnvironmentFromHost('appuat2.ace.aaa.com');
        expect(env).toEqual(Environments.uat2);
      });
    });

    describe('when url starts with app.', () => {
      it('should return stage env', () => {
        env = getEnvironmentFromHost('app.clublabs.net');
        expect(env).toEqual(Environments.prod);

        env = getEnvironmentFromHost('app.ace.aaa.com');
        expect(env).toEqual(Environments.prod);
      });
    });
  });

  describe('getApiDomain', () => {
    let domainName = '';
    it('returns expected domain name per env', () => {
      domainName = getApiDomain(Environments.dev1);
      expect(domainName).toEqual('common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.dev2);
      expect(domainName).toEqual('common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.qa1);
      expect(domainName).toEqual('common.api.qa.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.qa2);
      expect(domainName).toEqual('common.api.qa.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.uat1);
      expect(domainName).toEqual('common.api.uat.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.uat2);
      expect(domainName).toEqual('common.api.uat.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.stage);
      expect(domainName).toEqual('common.api.uat.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');

      domainName = getApiDomain(Environments.prod);
      expect(domainName).toEqual('common.api.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol');
    });

    it('returns correct domain for behind login flow', () => {
      let result = '';

      result = getApiDomainBehindLogin(Environments.dev1);
      expect(result).toEqual('apidev1.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.dev2);
      expect(result).toEqual('apidev2.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.qa1);
      expect(result).toEqual('apiqa1.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.qa2);
      expect(result).toEqual('apiqa2.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.uat1);
      expect(result).toEqual('apiuat1.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.uat2);
      expect(result).toEqual('apiuat2.ace.aaa.com/insurance-auto-efnol');

      result = getApiDomainBehindLogin(Environments.prod);
      expect(result).toEqual('api.ace.aaa.com/insurance-auto-efnol');
    });
  });

  it('returns correct domain for behind login flow', () => {
    let result = '';

    result = getApiDomainBehindLogin(Environments.dev1);
    expect(result).toEqual('apidev1.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.dev2);
    expect(result).toEqual('apidev2.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.qa1);
    expect(result).toEqual('apiqa1.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.qa2);
    expect(result).toEqual('apiqa2.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.uat1);
    expect(result).toEqual('apiuat1.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.uat2);
    expect(result).toEqual('apiuat2.ace.aaa.com/insurance-auto-efnol');

    result = getApiDomainBehindLogin(Environments.prod);
    expect(result).toEqual('api.ace.aaa.com/insurance-auto-efnol');
  });

  describe('getPolicyApiDomain', () => {
    let domainName = '';
    it('returns expected domain name per env', () => {
      domainName = getPolicyViewApiDomain(Environments.dev1);
      expect(domainName).toEqual(
        'common.api.dev.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.dev2);
      expect(domainName).toEqual(
        'common.api.dev.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.qa1);
      expect(domainName).toEqual(
        'common.api.qa.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.qa2);
      expect(domainName).toEqual(
        'common.api.qa.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.uat1);
      expect(domainName).toEqual(
        'common.api.uat.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.uat2);
      expect(domainName).toEqual(
        'common.api.uat.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.prod);
      expect(domainName).toEqual(
        'common.api.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );
    });
  });

  describe('getPolicyApiDomain', () => {
    let domainName = '';
    it('returns expected domain name per env', () => {
      domainName = getPolicyViewApiDomain(Environments.dev1);
      expect(domainName).toEqual(
        'common.api.dev.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.dev2);
      expect(domainName).toEqual(
        'common.api.dev.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.qa1);
      expect(domainName).toEqual(
        'common.api.qa.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.qa2);
      expect(domainName).toEqual(
        'common.api.qa.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.uat1);
      expect(domainName).toEqual(
        'common.api.uat.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.uat2);
      expect(domainName).toEqual(
        'common.api.uat.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );

      domainName = getPolicyViewApiDomain(Environments.prod);
      expect(domainName).toEqual(
        'common.api.ace.aaa.com/insurance-self-service-policy-view/policyview'
      );
    });
  });

  describe('getEndpoints', () => {
    const url = 'localhost';
    it('returns correct endpoint for CreateAutoClaim', () => {
      const result = getEndpoints(url);
      expect(result.createAutoClaimUrl).toContain('/claim');
    });

    it('returns correct endpoint for GetSafeliteRedirectUrl', () => {
      const result = getEndpoints(url);
      expect(result.getSafeliteRedirectUrl).toContain('/safelite-redirect');
    });

    it('returns correct endpoint for SubmitAutoClaim', () => {
      const result = getEndpoints(url);
      expect(result.submitAutoClaimUrl).toContain('/claim');
    });

    it('returns correct endpoint for GetAutoPolicyInfo', () => {
      const result = getEndpoints(url);
      expect(result.getAutoPolicyInfo).toContain('/policy-info');
    });

    it('returns correct endpoint for GetAutoClaimInfo', () => {
      const result = getEndpoints(url);
      expect(result.getAutoClaimInfo).toContain('/claim-info');
    });

    it('returns correct endpoint for InsurancePolicyFlowDirector', () => {
      const result = getEndpoints(url);
      expect(result.insurancePolicyFlowDirector).toContain('/flow-director');
    });

    it('returns correct endpoint for GetInitialData', () => {
      const result = getEndpoints(url);
      expect(result.getInitialDataUrl).toContain('/initial-data');
    });
  });
});
