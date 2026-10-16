import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { ClubCodes } from '@ace-clublabs/iss-common-util';
import { AppSource, mockPolicyNumber } from '@lib/types';
import { Layout } from './Layout';
import * as RedirectToTimeoutPage from '../ErrorPages/RedirectToTimeoutPage';
import * as hooks from '../../hooks';
import { Pages } from '../../shared/pages';
import { initialState, State } from '../../store/reducer';
import type { Actions } from '../../store/actions';
import { AppStateProvider } from '../../store/AppStateContext';
import { getById, getByRole } from '../../utils/test-utils';
import * as HttpRequestHelper from '../../utils/HttpRequestHelper';
import * as Utils from '../../utils';
import LogCannon from '@ace-clublabs/log-cannon';
import { Features } from '@ace-clublabs/feature-flags';
import { ISerializedError } from '../../types';

/** Test wrapper: provides AppStateContext so Layout can call useAppState(). */
const LayoutWithProvider = ({
  appState,
  dispatch
}: {
  appState: State;
  dispatch: React.Dispatch<Actions>;
}) => (
  <AppStateProvider value={{ appState, dispatch }}>
    <Layout />
  </AppStateProvider>
);

let mockedDispatch = vi.fn();
let mockedUseNavigate = vi.fn();

vi.mock('react-router');
vi.mock('../../utils/HttpRequestHelper');
vi.mock('../ErrorPages/RedirectToTimeoutPage');
vi.mock('../../hooks');
vi.mock('../../utils/ComponentHelper', () => ({
  __esModule: true,
  navigateToHome: vi.fn(),
  getCallPhoneNumber: vi.fn(),
  getPathname: vi.fn(),
  getBackButtonLabel: vi.fn().mockReturnValue('Back'),
  getCustomerServiceNumber: vi.fn().mockReturnValue('1-800-000-0000')
}));
vi.mock('../../utils', () => ({
  navigateToHome: vi.fn(),
  getLogData: vi.fn().mockReturnValue({}),
  setUnhandledErrorContextProvider: vi.fn()
}));
vi.mock('../../utils/brandConfig', () => ({
  getBrandConfig: vi.fn().mockReturnValue({ homeUrl: 'https://www.aaa.com' })
}));

const redirectToSystemTimeoutPageSpy = vi.spyOn(RedirectToTimeoutPage, 'RedirectToTimeoutPage');

const getParamsSpy = vi.spyOn(HttpRequestHelper, 'getParams');
const useLocationSpy = vi.spyOn(router, 'useLocation');
const useTimeoutSpy = vi.spyOn(hooks, 'useTimeout');
const useGenerateTokenSpy = vi.spyOn(hooks, 'useGenerateTokenAndPolicyNumber');
const useAuthenticatedTokenSpy = vi.spyOn(hooks, 'useAuthenticatedTokenAndPolicyNumber');
const useGetUrlParamsSpy = vi.spyOn(hooks, 'useGetUrlParams');
const useNavigateSpy = vi.spyOn(router, 'useNavigate');
const performanceGetEntriesByTypeSpy = vi.spyOn(performance, 'getEntriesByType');
const navigateToHomeSpy = vi.spyOn(Utils, 'navigateToHome');

const mockAppState: State = {
  ...initialState,
  clubCode: ClubCodes.ANE,
  policyNumber: mockPolicyNumber,
  token: 'some-token',
  claimsViewGuid: 'some-claims-view-guid',
  sourceApp: 'ClaimsView' as AppSource
};

const loggerErrorSpy = vi.spyOn(LogCannon, 'error');
const originalSessionStorage = window.sessionStorage;

describe('Layout', () => {
  beforeEach(() => {
    mockedUseNavigate.mockClear();
    loggerErrorSpy.mockClear();
    useLocationSpy.mockImplementation(() => ({ pathname: '/test-pathname' }) as any);
    useNavigateSpy.mockImplementation(() => mockedUseNavigate);
    useTimeoutSpy.mockReturnValue({ isIDLE: false });
    useGenerateTokenSpy.mockReturnValue({
      loading: false,
      token: 'some-token',
      policyNumber: mockPolicyNumber,
      clubCode: 'ANE',
      clubCodeError: undefined,
      isTokenInfoError: false
    });
    useAuthenticatedTokenSpy.mockReturnValue({
      loading: false,
      token: 'some-token',
      policyNumber: mockPolicyNumber,
      clubCode: 'ANE',
      clubCodeError: undefined,
      isTokenInfoError: false
    });
    getParamsSpy.mockImplementation(() => ({
      policyNumber: mockPolicyNumber
    }));
    // navigateToHome is mocked via vi.mock
    useGetUrlParamsSpy.mockReturnValue({
      policyGuidFromParams: undefined,
      area: undefined,
      clubCode: undefined,
      isMobileApp: undefined,
      isMobileAppAccidentDetection: undefined,
      crashDatePrediction: undefined,
      splashStart: undefined,
      splashEnd: undefined,
      isW: undefined,
      queryParams: new URLSearchParams(),
      searchQueryString: ''
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true
    });
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('Should display Header with Back Button if the pathname is /', () => {
    useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
    const { container } = render(
      <BrowserRouter basename='/'>
        <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
      </BrowserRouter>
    );

    const backButton = getById(container, 'backButton');
    expect(backButton).toBeVisible();
    const contentContainer = getById(container, 'content');
    expect(contentContainer).toHaveClass('content');
  });
  it('Should display Header with Back Button if the pathname is /filing-claim', () => {
    useLocationSpy.mockImplementation(() => ({ pathname: '/filing-claim' }) as any);
    const { container } = render(
      <BrowserRouter basename='/'>
        <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
      </BrowserRouter>
    );

    const backButton = getById(container, 'backButton');
    expect(backButton).toBeVisible();
    const contentContainer = getById(container, 'content');
    expect(contentContainer).toHaveClass('content');
  });

  it('Should display Header without Back Button if the pathname is /confirmation', () => {
    useLocationSpy.mockImplementation(() => ({ pathname: '/confirmation' }) as any);
    const { container } = render(
      <BrowserRouter basename='/'>
        <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
      </BrowserRouter>
    );

    const backButton = getById(container, 'backButton');
    expect(backButton).toBeNull();
    const contentContainer = getById(container, 'content');
    expect(contentContainer).toHaveClass('content');
  });

  it('should redirect to home page if back navigation is detected', async () => {
    useLocationSpy.mockImplementation(() => ({ pathname: '/safelite-redirect' }) as any);

    const mockSessionData: Record<string, string> = {
      safeliteRedirectInitiated: 'true',
      clubCode: mockAppState.clubCode as string,
      policyNumber: mockAppState.policyNumber as string,
      sourceApp: mockAppState.sourceApp as string,
      policyGuid: 'some-policy-guid'
    };

    const getItemMock = vi.fn((key: string) => mockSessionData[key] ?? null);
    const removeItemMock = vi.fn();
    const setItemMock = vi.fn();

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: getItemMock,
        setItem: setItemMock,
        removeItem: removeItemMock,
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    performanceGetEntriesByTypeSpy.mockImplementation(() => [{ type: 'back_forward' } as any]);

    await act(async () => {
      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
    });

    // The navigateToHome function is called and it triggers window.location.replace
    // We verify this by checking that the sessionStorage values were read
    // (which only happens if the back navigation condition was met)
    expect(getItemMock).toHaveBeenCalledWith('safeliteRedirectInitiated');
    expect(getItemMock).toHaveBeenCalledWith('clubCode');
    expect(getItemMock).toHaveBeenCalledWith('policyNumber');
    expect(getItemMock).toHaveBeenCalledWith('sourceApp');
    expect(getItemMock).toHaveBeenCalledWith('policyGuid');

    expect(removeItemMock).toHaveBeenCalledWith('safeliteRedirectInitiated');

    expect(navigateToHomeSpy).toHaveBeenCalledWith(
      mockAppState.clubCode,
      mockAppState.sourceApp,
      mockAppState.policyNumber,
      'AAA'
    );
  });

  describe('Progress bar and header Navigation for Step 1', () => {
    it('Should display Header with Back Button and Step 1/5 incident information for page /when-accident', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/when-accident' }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');
      const headerNavigation = getByText('Step 1/5: incident information');
      expect(headerNavigation).toBeVisible();

      expect(backButton).toBeVisible();
      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
    it('Should display Header with Back Button and Step 1/5 incident information for page /where-accident', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/where-accident' }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');
      const headerNavigation = getByText('Step 1/5: incident information');
      expect(headerNavigation).toBeVisible();
    });
    it('Should display Header with Back Button and Step 1/5 incident information for page /contact-information', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.ContactInformation }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const headerNavigation = getByText('Step 1/5: incident information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
    it('Should display Header with Back Button and Step 1/5 incident information for page /who-is-reporting', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhoIsReporting }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      const headerNavigation = getByText('Step 1/5: incident information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
  });

  describe('Progress bar and header Navigation for Step 2', () => {
    it('Should display Header with Back Button and Step 2/5 your information for page /vehicle-involved', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.VehicleInvolved }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /driven-or-parked', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.DrivenOrParked }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /driven-incident-details', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.DrivenIncidentDetails }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /parked-incident-details', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.ParkedIncidentDetails }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /damage-by-weather', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.DamageByWeather }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '40');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /who-was-driving', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhoWasDriving }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '40');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /passengers', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.Passengers }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /anyone-injured', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.AnyoneInjured }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /what-happened', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhatHappened }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '70');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /vehicle-towed', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.VehicleTowed }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '80');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
    it('Should display Header with Back Button and Step 2/5 your information for page /vehicledamage', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.VehicleDamage }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '90');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 2/5 your information for page /vehiclesinvolvednumber', () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: Pages.NumberOfVehiclesInvolved }) as any
      );
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const headerNavigation = getByText('Step 2/5: your information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();
    });
  });

  describe('Progress bar and header Navigation for Step 3', () => {
    it('Should display Header with Back Button and Step 3/5: other party information for page /other-party-ymm', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyYMM }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
      const headerNavigation = getByText('Step 3/5: other party information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
    it('Should display Header with Back Button and Step 4/5: additional details for page /other-party-witnesses', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyWitnesses }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
      const headerNavigation = getByText('Step 4/5: additional details');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
    it('Should display Header with Back Button and Step 4/5: additional details for page /other-party-pedestrian', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyPedestrian }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
      const headerNavigation = getByText('Step 4/5: additional details');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 3/5: other party information for page /other-party-driver-information', () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: Pages.OtherPartyDriverInformation }) as any
      );
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      const headerNavigation = getByText('Step 3/5: other party information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 3/5: other party information for page /other-party-insurance', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyInsurance }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '40');
      const headerNavigation = getByText('Step 3/5: other party information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 3/5: other party information for page /other-party-anyone-injured', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyAnyoneInjured }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const headerNavigation = getByText('Step 3/5: other party information');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
  });

  describe('Progress bar and header Navigation for Step 4 (Additional Details)', () => {
    it('Should display Header with Back Button and Step 4/5: additional details for page /other-party-property-damage', () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: Pages.OtherPartyPropertyDamage }) as any
      );
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const headerNavigation = getByText('Step 4/5: additional details');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 4/5: additional details for page /other-party-witnesses', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyWitnesses }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
      const headerNavigation = getByText('Step 4/5: additional details');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('Should display Header with Back Button and Step 4/5: additional details for page /other-party-pedestrian', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.OtherPartyPedestrian }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
      const headerNavigation = getByText('Step 4/5: additional details');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
  });

  describe('Progress bar and header Naviation for Step 5', () => {
    it('Should display Header with Back Button and Step 5/5: review for page /review-claim', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.ReviewClaim }) as any);
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
      const progressBar = getByRole(container, 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const headerNavigation = getByText('Step 5/5: review');
      expect(headerNavigation).toBeVisible();
      expect(backButton).toBeVisible();

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });
  });

  describe('The route is a transition-pages (API calls) ', () => {
    it('Should display Header without Back Button if path is /create-claim-transition', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/create-claim-transition' }) as any);
      const result = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const backButton = getById(result.container, 'backButton');
      expect(backButton).toBeNull();
      const progressBar = getByRole(result.container, 'progressbar');
      expect(progressBar).toBeNull();
      const headerNavigation = getById(result.container, 'headerNavigation');
      expect(headerNavigation).toBeNull();
    });
  });

  describe('Timeout scenarios', () => {
    it('redirects to system timeout page', () => {
      redirectToSystemTimeoutPageSpy.mockImplementation(() => {
        return <h1>RedirectToSystemTimeoutPage</h1>;
      });
      useTimeoutSpy.mockReturnValue({ isIDLE: true });

      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(redirectToSystemTimeoutPageSpy).toHaveBeenCalledTimes(1);
      expect(container).toHaveTextContent('RedirectToSystemTimeoutPage');
    });
  });

  describe('Set token and policy number from Ace-Identity library', () => {
    it('Get valid token', () => {
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });
      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
    });
    it('Get invalid token', () => {
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: true
      });
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const whiteContainer = getById(container, 'white-container');
      expect(whiteContainer).toBeVisible();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Token info retrieval error', expect.anything());
    });
    it('should log error with errorData included when clubCodeError is present', () => {
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: '065',
        clubCodeError: 'Club code retrieval failed',
        isTokenInfoError: true
      });
      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith('Unsupported market detected', expect.anything());
    });
    it('should navigate to SystemError when isTokenInfoError is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/when-accident' }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: true
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.SystemError);
    });
    it('should not navigate to SystemError when isTokenInfoError is false', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/when-accident' }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });
  });

  describe('Mobile native app — logo and back button suppression', () => {
    it('hides logo on all pages when appState.isMobileApp is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhenAccident }) as any);
      const mobileAppState = { ...mockAppState, isMobileApp: true };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const logo = container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(logo).toBeNull();
    });

    it('hides logo on all pages when appState.isMobileAppAccidentDetection is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhenAccident }) as any);
      const mobileAppState = { ...mockAppState, isMobileAppAccidentDetection: 'true' };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const logo = container.querySelector('[data-quid="SCL-AppHeaderLogoIcon"]');
      expect(logo).toBeNull();
    });

    it('hides back button on IntroTransition page when isMobileApp is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.IntroTransition }) as any);
      const mobileAppState = { ...mockAppState, isMobileApp: true };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeNull();
    });

    it('hides back button on Intro page when isMobileApp is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.Intro }) as any);
      const mobileAppState = { ...mockAppState, isMobileApp: true };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeNull();
    });

    it('hides back button on IntroTransition page when isMobileAppAccidentDetection is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.IntroTransition }) as any);
      const mobileAppState = { ...mockAppState, isMobileAppAccidentDetection: 'true' };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeNull();
    });

    it('hides back button on Intro page when isMobileAppAccidentDetection is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.Intro }) as any);
      const mobileAppState = { ...mockAppState, isMobileAppAccidentDetection: 'true' };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeNull();
    });

    it('shows back button on other pages even when isMobileApp is true', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.WhenAccident }) as any);
      const mobileAppState = { ...mockAppState, isMobileApp: true };
      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mobileAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );
      const backButton = getById(container, 'backButton');
      expect(backButton).toBeVisible();
    });

    it('dispatches setIsMobileApp when isMobileApp=true is in URL params', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: 'true',
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: undefined,
        queryParams: new URLSearchParams(),
        searchQueryString: ''
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_IS_MOBILE_APP', payload: true })
      );
    });
  });

  describe('Behind login flow', () => {
    it('should pass isAnonymous as false when pathname starts with /behindlogin', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.BehindLoginEntry }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(useAuthenticatedTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isAnonymous: false
        })
      );
    });

    it('should pass isAnonymous as false when pathname starts with /behindlogin/:policyGuid', () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: '/behindlogin/some-policy-guid' }) as any
      );
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(useAuthenticatedTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isAnonymous: false
        })
      );
    });

    it('should pass isAnonymous as true when pathname does not start with /behindlogin', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(useAuthenticatedTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isAnonymous: true
        })
      );
    });

    it('should handle case-insensitive /BehindLogin path', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/BehindLogin' }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: 'ANE',
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      expect(useAuthenticatedTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isAnonymous: false
        })
      );
    });
  });

  describe('Error page scenarios', () => {
    it('should render layout on SessionTimedOut page even without policyNumber and token', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.SessionTimedOut }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('should render layout on SystemError page even without policyNumber and token', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.SystemError }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const contentContainer = getById(container, 'content');
      expect(contentContainer).toHaveClass('content');
    });

    it('should not render layout on non-error page without policyNumber and token', () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/when-accident' }) as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: undefined,
        policyNumber: undefined,
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      const { container } = render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider appState={initialState} dispatch={mockedDispatch} />
        </BrowserRouter>
      );

      const whiteContainer = getById(container, 'white-container');
      expect(whiteContainer).toBeVisible();
      const contentContainer = getById(container, 'content');
      expect(contentContainer).toBeNull();
    });
  });

  describe('Brand (WInsurance) URL param handling', () => {
    it('dispatches SET_BRAND WInsurance when isW=true is in URL params', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: 'true',
        queryParams: new URLSearchParams(),
        searchQueryString: ''
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_BRAND', payload: 'WInsurance' })
      );
    });

    it('dispatches SET_BRAND AAA when isW is absent and no sessionStorage brand', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: undefined,
        queryParams: new URLSearchParams(),
        searchQueryString: ''
      });

      const getItemMock = vi.fn(() => null);
      Object.defineProperty(window, 'sessionStorage', {
        value: { ...window.sessionStorage, getItem: getItemMock, setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), length: 0, key: vi.fn() },
        writable: true
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_BRAND', payload: 'AAA' })
      );
    });

    it('dispatches SET_BRAND WInsurance when isW is absent but sessionStorage has WInsurance', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: undefined,
        queryParams: new URLSearchParams(),
        searchQueryString: ''
      });

      const getItemMock = vi.fn((key: string) => (key === 'brand' ? 'WInsurance' : null));
      Object.defineProperty(window, 'sessionStorage', {
        value: { ...window.sessionStorage, getItem: getItemMock, setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), length: 0, key: vi.fn() },
        writable: true
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_BRAND', payload: 'WInsurance' })
      );
    });

    it('persists WInsurance brand when isW=false is set in URL (WInsurance session survives URL tampering)', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: 'false',
        queryParams: new URLSearchParams('isW=false'),
        searchQueryString: '?isW=false'
      });

      const getItemMock = vi.fn((key: string) => (key === 'brand' ? 'WInsurance' : null));
      Object.defineProperty(window, 'sessionStorage', {
        value: { ...window.sessionStorage, getItem: getItemMock, setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), length: 0, key: vi.fn() },
        writable: true
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_BRAND', payload: 'WInsurance' })
      );
    });

    it('persists WInsurance brand when isW is removed from URL (WInsurance session survives URL param removal)', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: undefined,
        queryParams: new URLSearchParams('policyNumber=ATX000158657'),
        searchQueryString: '?policyNumber=ATX000158657'
      });

      const getItemMock = vi.fn((key: string) => (key === 'brand' ? 'WInsurance' : null));
      Object.defineProperty(window, 'sessionStorage', {
        value: { ...window.sessionStorage, getItem: getItemMock, setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), length: 0, key: vi.fn() },
        writable: true
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider appState={mockAppState} dispatch={mockedDispatch} />
          </BrowserRouter>
        );
      });

      expect(mockedDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_BRAND', payload: 'WInsurance' })
      );
    });
  });

  describe('isW query param injection (ISS-18399)', () => {
    it('injects ?isW=true when brand is WInsurance and isW is absent from the URL', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/whattoexpect', search: '' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance' }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).toHaveBeenCalledWith({ search: 'isW=true' }, { replace: true });
    });

    it('preserves existing search params when injecting isW=true', async () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: '/whattoexpect', search: '?area=240&clubCode=240' }) as any
      );

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance' }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).toHaveBeenCalledWith(
        { search: 'area=240&clubCode=240&isW=true' },
        { replace: true }
      );
    });

    it('does not inject isW=true when brand is AAA', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/whattoexpect', search: '' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'AAA' }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(
        expect.objectContaining({ search: expect.stringContaining('isW') }),
        expect.anything()
      );
    });

    it('does not inject isW=true when it is already present in the URL', async () => {
      useLocationSpy.mockImplementation(
        () => ({ pathname: '/whattoexpect', search: '?isW=true' }) as any
      );

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance' }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(
        { search: expect.stringContaining('isW') },
        { replace: true }
      );
    });
  });

  describe('WInsurance feature flag guard (ISS-18069)', () => {
    const wInsuranceFlagOff: State['autoEFNOLFeatureFlags'] = {
      [Features.AutoEFNOLCustomVehicle]: true,
      [Features.AutoEFNOLCustomReporter]: true,
      [Features.AutoEFNOLCustomDriver]: true,
      [Features.AutoEFNOLEnableWInsurance]: false
    };

    const wInsuranceFlagOn: State['autoEFNOLFeatureFlags'] = {
      [Features.AutoEFNOLCustomVehicle]: true,
      [Features.AutoEFNOLCustomReporter]: true,
      [Features.AutoEFNOLCustomDriver]: true,
      [Features.AutoEFNOLEnableWInsurance]: true
    };

    // AC-1: flag OFF + brand WInsurance → navigate to system error page
    it('should navigate to system error page when WInsurance feature flag is off', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: wInsuranceFlagOff }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.SystemError, { replace: true });
    });

    it('should log a masked informational message via LogCannon when redirecting WInsurance user', async () => {
      const loggerBlastSpy = vi.spyOn(LogCannon, 'blast');
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: wInsuranceFlagOff }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(loggerBlastSpy).toHaveBeenCalledWith(
        expect.stringContaining('WInsurance feature flag is off'),
        expect.anything()
      );
      loggerBlastSpy.mockRestore();
    });

    // AC-1 edge: sessionStorage-persisted WInsurance brand (no ?isW=true on current URL) + flag off
    it('should navigate to system error when brand is WInsurance from sessionStorage and flag is off', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);
      useGetUrlParamsSpy.mockReturnValue({
        policyGuidFromParams: undefined,
        area: undefined,
        clubCode: undefined,
        isMobileApp: undefined,
        isMobileAppAccidentDetection: undefined,
        crashDatePrediction: undefined,
        splashStart: undefined,
        splashEnd: undefined,
        isW: undefined,
        queryParams: new URLSearchParams(),
        searchQueryString: ''
      });

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: wInsuranceFlagOff }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.SystemError, { replace: true });
    });

    // AC-2: flag ON + brand WInsurance → no redirect
    it('should not redirect WInsurance user when feature flag is on', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: wInsuranceFlagOn }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });

    // AC-3: flag OFF + brand AAA → no redirect
    it('should not redirect AAA user when feature flag is off', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'AAA', autoEFNOLFeatureFlags: wInsuranceFlagOff }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });

    // AC-4: flag ON + brand AAA → no redirect
    it('should not redirect AAA user when feature flag is on', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'AAA', autoEFNOLFeatureFlags: wInsuranceFlagOn }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });

    // Edge: feature flags not yet loaded → no premature redirect
    it('should not redirect while feature flags are still loading', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: '/' }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: undefined }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });

    // Edge: already on system error page → no re-navigate (avoids infinite loop)
    it('should not re-navigate when already on the system error page', async () => {
      useLocationSpy.mockImplementation(() => ({ pathname: Pages.SystemError }) as any);

      await act(async () => {
        render(
          <BrowserRouter basename='/'>
            <LayoutWithProvider
              appState={{ ...mockAppState, brand: 'WInsurance', autoEFNOLFeatureFlags: wInsuranceFlagOff }}
              dispatch={mockedDispatch}
            />
          </BrowserRouter>
        );
      });

      expect(mockedUseNavigate).not.toHaveBeenCalledWith(Pages.SystemError);
    });
  });

  describe('Navigation logging without clubCode (e.g. PStar markets)', () => {
    it('should fire navigation log when policyNumber and loginFlowType are present but clubCode is undefined', () => {
      const loggerBlastSpy = vi.spyOn(LogCannon, 'blast');
      const getLogDataSpy = vi.spyOn(Utils, 'getLogData').mockReturnValue({
        policyNumber: 'A12345678',
        loginFlowType: 'ANONYMOUS',
        clubCode: undefined
      } as any);
      useAuthenticatedTokenSpy.mockReturnValue({
        loading: false,
        token: 'some-token',
        policyNumber: 'A12345678',
        clubCode: undefined,
        clubCodeError: undefined,
        isTokenInfoError: false
      });

      render(
        <BrowserRouter basename='/'>
          <LayoutWithProvider
            appState={{
              ...mockAppState,
              clubCode: undefined,
              policyNumber: 'A12345678',
              loginFlowType: 'ANONYMOUS' as any
            }}
            dispatch={mockedDispatch}
          />
        </BrowserRouter>
      );

      expect(loggerBlastSpy).toHaveBeenCalledWith(
        expect.stringContaining('Navigate to'),
        expect.anything()
      );
      loggerBlastSpy.mockRestore();
      getLogDataSpy.mockRestore();
    });
  });
});
