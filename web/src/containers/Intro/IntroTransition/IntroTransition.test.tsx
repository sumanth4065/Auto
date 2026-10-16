import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { Features } from '@ace-clublabs/feature-flags';
import type { FeatureFlagService } from '@ace-clublabs/feature-flags';
import { FeatureFlagContext } from '@ace-clublabs/feature-flags/react';
import LogCannon from '@ace-clublabs/log-cannon';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import { LoginFlowType } from '@lib/shared-contracts';
import { policyInfoResponseFixture } from '@lib/types';
import { IntroTransition } from './IntroTransition';
import * as navigateToErrorPage from '../../../utils/ComponentHelper';
import * as hooks from '../../../hooks';
import { setAutoEFNOLFeatureFlags } from '../../../store/actions';
import { ISerializedError } from '../../../types';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const useGetAutoPolicyInfoSpy = vi.spyOn(hooks, 'useGetAutoPolicyInfo');
const useGetInitialDataSpy = vi.spyOn(hooks, 'useGetInitialData');
const useGetPolicyConversionSpy = vi.spyOn(hooks, 'useGetPolicyConversion');
const navigateToErrorPageSpy = vi.spyOn(navigateToErrorPage, 'navigateToErrorPage');
const getTreatmentMock = vi.fn();
const logCannonSpy = vi.spyOn(LogCannon, 'error');

const stubFeatureFlagService = {
  getTreatment: getTreatmentMock
} as unknown as FeatureFlagService;

const featureFlagContextValue = {
  service: stubFeatureFlagService,
  userKey: 'ISS-CLAIMS'
};

describe('IntroTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [{}, mockedDispatch]);
    getTreatmentMock.mockImplementation(async (_target: string, name: Features) => ({
      name,
      treatment:
        name === Features.AutoEFNOLCustomVehicle ||
        name === Features.AutoEFNOLCustomReporter ||
        name === Features.AutoEFNOLCustomDriver
          ? ('on' as const)
          : ('off' as const)
    }));
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: true,
      error: null,
      autoPolicyInfo: {
        policyGeneralInfo: {
          inceptionDate: '12/10/2020',
          policyClass: 'PPA',
          policyType: 'Auto',
          status: 'ACTIVE',
          termEffectiveDate: '12/10/2020',
          termExpirationDate: '12/10/2021',
          priorPolicyNumber: 'some-prior-policy-number'
        }
      }
    }));
    useGetPolicyConversionSpy.mockImplementation(() => ({ loading: false, error: null }));
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    navigateToErrorPageSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to /whattoexpect if useGetAutoPolicyInfo and useGetInitialData are a success', async () => {
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedUseNavigate).toBeCalledWith('/whattoexpect');
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      payload: '2020-12-10T08:00:00.000Z',
      type: 'SET_EFFECTIVE_DATE'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      payload: '2021-12-10T08:00:00.000Z',
      type: 'SET_EXPIRATION_DATE'
    });
  });

  it('should redirect to /whattoexpect if useGetAutoPolicyInfo and useGetInitialData are a success and have a priorPolicyNumber', async () => {
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: {
        ...policyInfoResponseFixture.data,
        policyGeneralInfo: {
          ...policyInfoResponseFixture.data.policyGeneralInfo,
          priorPolicyNumber: 'some-prior-policy-number'
        }
      }
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedUseNavigate).toBeCalledWith('/whattoexpect');
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      payload: '2020-12-10T08:00:00.000Z',
      type: 'SET_EFFECTIVE_DATE'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      payload: '2021-12-10T08:00:00.000Z',
      type: 'SET_EXPIRATION_DATE'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      payload: 'some-prior-policy-number',
      type: 'SET_PRIOR_POLICY_NUMBER'
    });
  });

  it('should redirect to error page if useGetAutoPolicyInfo is a failure', () => {
    const mockError = {
      errorLabel: 'some-error-name',
      errorMessage: 'some-error-message'
    } as ISerializedError;
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: mockError,
      autoPolicyInfo: undefined
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );
    expect(navigateToErrorPageSpy).toHaveBeenCalledWith(
      {
        errorLabel: 'some-error-name',
        errorMessage: 'some-error-message'
      },
      mockedUseNavigate
    );
  });

  it('should redirect to error page if useGetInitialData is a failure', () => {
    const mockError = {
      errorLabel: 'some-error-name',
      errorMessage: 'some-error-message'
    } as ISerializedError;
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));
    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: mockError
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    expect(navigateToErrorPageSpy).toHaveBeenCalledWith(
      {
        errorLabel: 'some-error-name',
        errorMessage: 'some-error-message'
      },
      mockedUseNavigate
    );
  });

  it('should set the auto EFNOL feature flags', async () => {
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalledWith(
        setAutoEFNOLFeatureFlags({
          [Features.AutoEFNOLCustomVehicle]: true,
          [Features.AutoEFNOLCustomReporter]: true,
          [Features.AutoEFNOLCustomDriver]: true,
          [Features.AutoEFNOLEnableWInsurance]: false
        })
      );
    });
  });

  it('should not set the auto EFNOL feature flags if the feature flag is not ready', () => {
    getTreatmentMock.mockImplementation(() => new Promise(() => {}));
    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    expect(mockedDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_AUTO_EFNOL_FEATURE_FLAGS' })
    );
  });

  it('should call useGetPolicyConversion with enabled=true when loginFlowType is ANONYMOUS', () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { loginFlowType: LoginFlowType.ANONYMOUS },
      mockedDispatch
    ]);

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useGetPolicyConversionSpy).toHaveBeenCalledWith(true, ConversionType.PSTAR_TO_GW);
  });

  it('should not navigate to /whattoexpect when useGetPolicyConversion is still loading', async () => {
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    useGetPolicyConversionSpy.mockImplementation(() => ({ loading: true, error: null }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedUseNavigate).not.toHaveBeenCalledWith('/whattoexpect');
    });
  });

  it('should call useGetPolicyConversion with enabled=false when loginFlowType is BEHIND_LOGIN', () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { loginFlowType: LoginFlowType.BEHIND_LOGIN },
      mockedDispatch
    ]);

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useGetPolicyConversionSpy).toHaveBeenCalledWith(false, ConversionType.PSTAR_TO_GW);
  });

  // ISS-18069: WInsurance feature flag registration
  it('should include AutoEFNOLEnableWInsurance in dispatched feature flags', async () => {
    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalledWith(
        setAutoEFNOLFeatureFlags({
          [Features.AutoEFNOLCustomVehicle]: true,
          [Features.AutoEFNOLCustomReporter]: true,
          [Features.AutoEFNOLCustomDriver]: true,
          [Features.AutoEFNOLEnableWInsurance]: false
        })
      );
    });
  });

  it('should set the auto EFNOL feature flags to false if evaluation errors', async () => {
    getTreatmentMock.mockRejectedValue(new Error('test'));

    useGetAutoPolicyInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      autoPolicyInfo: policyInfoResponseFixture.data
    }));

    useGetInitialDataSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    render(
      <FeatureFlagContext.Provider value={featureFlagContextValue}>
        <BrowserRouter basename='/'>
          <IntroTransition />
        </BrowserRouter>
      </FeatureFlagContext.Provider>,
      { wrapper: scl.ThemeProvider }
    );

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalledWith(
        setAutoEFNOLFeatureFlags({
          [Features.AutoEFNOLCustomVehicle]: false,
          [Features.AutoEFNOLCustomReporter]: false,
          [Features.AutoEFNOLCustomDriver]: false,
          [Features.AutoEFNOLEnableWInsurance]: false
        })
      );
      expect(logCannonSpy).toHaveBeenCalledWith(
        'Error fetching feature flags',
        expect.objectContaining({
          error: 'test',
          errorData: expect.objectContaining({
            errorType: 'client',
            errorLabel: 'Error',
            errorMessage: 'test'
          })
        })
      );
    });
  });
});
